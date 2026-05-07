import json
import time
import random
import os
from datetime import datetime
from playwright.sync_api import sync_playwright, TimeoutError as PlaywrightTimeout

OUTPUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'output', 'raw')

JOB_KEYWORDS = [
    '行政经理', 'HRBP', '运营经理', '项目经理', '市场经理',
    '产品经理', '数据分析师', '商务经理', '采购经理', '客服经理'
]

EXPERIENCE_FILTERS = ['应届生', '不限经验', '1年以内']

USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
]

MAX_RETRIES = 3
PAGE_LOAD_TIMEOUT = 30000
ELEMENT_WAIT_TIMEOUT = 10000


def parse_salary(salary_text):
    salary_min = None
    salary_max = None

    if not salary_text:
        return salary_min, salary_max

    salary_text = salary_text.replace('·', '').replace('13薪', '').replace('14薪', '').replace('15薪', '')

    if 'K' in salary_text or 'k' in salary_text:
        parts = salary_text.replace('K', '').replace('k', '').split('-')
        if len(parts) == 2:
            try:
                salary_min = int(float(parts[0].strip()) * 1000)
                salary_max = int(float(parts[1].strip()) * 1000)
            except ValueError:
                pass
    elif '万' in salary_text:
        parts = salary_text.replace('万', '').split('-')
        if len(parts) == 2:
            try:
                salary_min = int(float(parts[0].strip()) * 10000)
                salary_max = int(float(parts[1].strip()) * 10000)
            except ValueError:
                pass
    elif '元' in salary_text and '天' in salary_text:
        try:
            daily = int(salary_text.replace('元', '').replace('/天', '').strip())
            salary_min = daily * 22
            salary_max = daily * 22
        except ValueError:
            pass

    return salary_min, salary_max


def random_delay(min_seconds=2, max_seconds=5):
    time.sleep(random.uniform(min_seconds, max_seconds))


def create_browser_context(playwright):
    browser = playwright.chromium.launch(
        headless=True,
        args=[
            '--disable-blink-features=AutomationControlled',
            '--disable-dev-shm-usage',
            '--no-sandbox',
        ]
    )

    context = browser.new_context(
        user_agent=random.choice(USER_AGENTS),
        viewport={'width': 1920, 'height': 1080},
        locale='zh-CN',
        timezone_id='Asia/Shanghai',
    )

    context.add_init_script("""
        Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
        Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3] });
        Object.defineProperty(navigator, 'languages', { get: () => ['zh-CN', 'zh', 'en'] });
    """)

    return browser, context


def crawl_zhipin(keyword, city='100010000', experience='不限'):
    results = []

    with sync_playwright() as p:
        browser, context = create_browser_context(p)
        page = context.new_page()

        try:
            base_url = f'https://www.zhipin.com/web/geek/job?query={keyword}&city={city}&experience={experience}'
            print(f"  [BOSS直聘] 访问: {base_url}")

            page.goto(base_url, timeout=PAGE_LOAD_TIMEOUT, wait_until='networkidle')
            random_delay(3, 5)

            for attempt in range(MAX_RETRIES):
                try:
                    page.wait_for_selector('.job-card-wrapper', timeout=ELEMENT_WAIT_TIMEOUT)
                    break
                except PlaywrightTimeout:
                    if attempt < MAX_RETRIES - 1:
                        print(f"  [BOSS直聘] 等待元素超时，重试 {attempt + 1}/{MAX_RETRIES}")
                        page.reload()
                        random_delay(2, 4)
                    else:
                        print(f"  [BOSS直聘] 页面加载失败，跳过")
                        return results

            job_cards = page.query_selector_all('.job-card-wrapper')
            print(f"  [BOSS直聘] 找到 {len(job_cards)} 个职位卡片")

            for card in job_cards[:10]:
                try:
                    job_title = card.query_selector('.job-name')
                    job_title = job_title.inner_text().strip() if job_title else ''

                    salary_elem = card.query_selector('.salary')
                    salary_text = salary_elem.inner_text().strip() if salary_elem else ''

                    company_elem = card.query_selector('.company-name a')
                    company_name = company_elem.inner_text().strip() if company_elem else ''

                    job_info = card.query_selector('.job-info')
                    job_info_text = job_info.inner_text().strip() if job_info else ''

                    tag_list = card.query_selector_all('.tag-list li')
                    skill_tags = [tag.inner_text().strip() for tag in tag_list]

                    salary_min, salary_max = parse_salary(salary_text)

                    city_text = ''
                    if '·' in job_info_text:
                        city_text = job_info_text.split('·')[0].strip()

                    result = {
                        'job_title': job_title,
                        'company_name': company_name,
                        'salary_min': salary_min,
                        'salary_max': salary_max,
                        'city': city_text or '全国',
                        'experience': experience,
                        'education': '',
                        'description': '',
                        'skill_tags': skill_tags,
                        'source': 'zhipin',
                        'source_url': page.url,
                        'publish_date': datetime.now().strftime('%Y-%m-%d'),
                        'crawl_time': datetime.now().isoformat()
                    }
                    results.append(result)
                except Exception as e:
                    print(f"  [BOSS直聘] 解析单条数据失败: {e}")
                    continue

        except PlaywrightTimeout:
            print(f"  [BOSS直聘] 页面加载超时")
        except Exception as e:
            print(f"  [BOSS直聘] 爬取失败: {e}")
        finally:
            context.close()
            browser.close()

    return results


def crawl_zhaopin(keyword, city='全国'):
    results = []

    with sync_playwright() as p:
        browser, context = create_browser_context(p)
        page = context.new_page()

        try:
            base_url = f'https://sou.zhaopin.com/?jl=530&kw={keyword}'
            print(f"  [智联招聘] 访问: {base_url}")

            page.goto(base_url, timeout=PAGE_LOAD_TIMEOUT, wait_until='networkidle')
            random_delay(3, 5)

            for attempt in range(MAX_RETRIES):
                try:
                    page.wait_for_selector('[class*="joblist-box__item"], [class*="positionlist"], .joblist-box__item', timeout=ELEMENT_WAIT_TIMEOUT)
                    break
                except PlaywrightTimeout:
                    if attempt < MAX_RETRIES - 1:
                        print(f"  [智联招聘] 等待元素超时，重试 {attempt + 1}/{MAX_RETRIES}")
                        page.reload()
                        random_delay(2, 4)
                    else:
                        print(f"  [智联招聘] 页面加载失败，跳过")
                        return results

            job_items = page.query_selector_all('[class*="joblist-box__item"], [class*="positionlist"] > div, .joblist-box__item')
            print(f"  [智联招聘] 找到 {len(job_items)} 个职位")

            for item in job_items[:10]:
                try:
                    title_elem = item.query_selector('a[class*="jobname"], a[class*="jobinfo__top__jobname__title"]')
                    job_title = title_elem.inner_text().strip() if title_elem else ''

                    salary_elem = item.query_selector('[class*="salary"], p[class*="jobinfo__top__salary"]')
                    salary_text = salary_elem.inner_text().strip() if salary_elem else ''

                    company_elem = item.query_selector('a[class*="companyname"], a[class*="companyinfo__top__name"]')
                    company_name = company_elem.inner_text().strip() if company_elem else ''

                    salary_min, salary_max = parse_salary(salary_text)

                    result = {
                        'job_title': job_title,
                        'company_name': company_name,
                        'salary_min': salary_min,
                        'salary_max': salary_max,
                        'city': city,
                        'experience': '',
                        'education': '',
                        'description': '',
                        'skill_tags': [],
                        'source': 'zhaopin',
                        'source_url': page.url,
                        'publish_date': datetime.now().strftime('%Y-%m-%d'),
                        'crawl_time': datetime.now().isoformat()
                    }
                    results.append(result)
                except Exception as e:
                    print(f"  [智联招聘] 解析单条数据失败: {e}")
                    continue

        except PlaywrightTimeout:
            print(f"  [智联招聘] 页面加载超时")
        except Exception as e:
            print(f"  [智联招聘] 爬取失败: {e}")
        finally:
            context.close()
            browser.close()

    return results


def validate_data(data):
    validated = []
    for item in data:
        if not item.get('job_title'):
            continue
        if not item.get('company_name'):
            continue
        if item.get('salary_min') is not None and item.get('salary_max') is not None:
            if item['salary_min'] > item['salary_max']:
                item['salary_min'], item['salary_max'] = item['salary_max'], item['salary_min']
        validated.append(item)
    return validated


def run_crawl(keywords=None, sources=None):
    if keywords is None:
        keywords = JOB_KEYWORDS
    if sources is None:
        sources = ['zhipin', 'zhaopin']

    all_results = []

    print(f"\n[爬虫] 开始采集，关键词: {len(keywords)} 个，数据源: {sources}")

    for keyword in keywords:
        print(f"\n[爬虫] 正在采集关键词: {keyword}")

        if 'zhipin' in sources:
            print(f"  → BOSS直聘...")
            try:
                results = crawl_zhipin(keyword)
                all_results.extend(results)
                print(f"  → 采集到 {len(results)} 条")
            except Exception as e:
                print(f"  → BOSS直聘采集异常: {e}")
            random_delay(3, 6)

        if 'zhaopin' in sources:
            print(f"  → 智联招聘...")
            try:
                results = crawl_zhaopin(keyword)
                all_results.extend(results)
                print(f"  → 采集到 {len(results)} 条")
            except Exception as e:
                print(f"  → 智联招聘采集异常: {e}")
            random_delay(3, 6)

    print(f"\n[爬虫] 数据验证...")
    all_results = validate_data(all_results)
    print(f"[爬虫] 验证后数据: {len(all_results)} 条")

    os.makedirs(OUTPUT_DIR, exist_ok=True)
    output_file = os.path.join(OUTPUT_DIR, f'jobs_{datetime.now().strftime("%Y%m%d_%H%M%S")}.json')
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(all_results, f, ensure_ascii=False, indent=2)

    print(f"\n[爬虫] 采集完成！共 {len(all_results)} 条数据")
    print(f"[爬虫] 数据已保存至: {output_file}")

    return all_results


if __name__ == '__main__':
    run_crawl()
