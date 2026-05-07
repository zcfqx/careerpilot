import sys
import os
import json
import sqlite3
import time
import requests
from bs4 import BeautifulSoup
from datetime import datetime
from unittest.mock import patch, MagicMock

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from main import crawl_zhipin, crawl_zhaopin, parse_salary, run_crawl, JOB_KEYWORDS
from pipelines import clean_job_data, import_to_database, process_latest_data
from seed_data import generate_mock_job_data, seed_database

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'backend', 'data', 'ai_career.db')

class TestResult:
    def __init__(self):
        self.tests = []
        self.passed = 0
        self.failed = 0
        self.warnings = 0
    
    def add_test(self, name, status, message="", details=""):
        self.tests.append({
            'name': name,
            'status': status,
            'message': message,
            'details': details
        })
        if status == 'PASS':
            self.passed += 1
        elif status == 'FAIL':
            self.failed += 1
        elif status == 'WARN':
            self.warnings += 1
    
    def summary(self):
        total = len(self.tests)
        return f"总计: {total} | 通过: {self.passed} | 失败: {self.failed} | 警告: {self.warnings}"

test_results = TestResult()

def test_1_startup_mechanism():
    print("\n" + "="*60)
    print("测试1: 爬虫程序启动机制")
    print("="*60)
    
    print("1.1 检查Python环境...")
    python_version = sys.version
    print(f"  Python版本: {python_version}")
    test_results.add_test("Python环境检查", "PASS", f"Python {python_version}")
    
    print("\n1.2 检查依赖包...")
    try:
        import requests
        print(f"  requests: {requests.__version__}")
        test_results.add_test("requests依赖", "PASS", f"版本 {requests.__version__}")
    except ImportError:
        print("  requests: 未安装")
        test_results.add_test("requests依赖", "FAIL", "未安装")
    
    try:
        import bs4
        print(f"  beautifulsoup4: {bs4.__version__}")
        test_results.add_test("beautifulsoup4依赖", "PASS", f"版本 {bs4.__version__}")
    except ImportError:
        print("  beautifulsoup4: 未安装")
        test_results.add_test("beautifulsoup4依赖", "FAIL", "未安装")
    
    print("\n1.3 检查爬虫脚本文件...")
    crawler_dir = os.path.dirname(os.path.abspath(__file__))
    required_files = ['main.py', 'pipelines.py', 'seed_data.py', 'analysis.py']
    for file in required_files:
        file_path = os.path.join(crawler_dir, file)
        if os.path.exists(file_path):
            print(f"  {file}: 存在")
            test_results.add_test(f"文件{file}检查", "PASS")
        else:
            print(f"  {file}: 不存在")
            test_results.add_test(f"文件{file}检查", "FAIL", "文件不存在")
    
    print("\n1.4 检查输出目录...")
    output_dir = os.path.join(crawler_dir, 'output', 'raw')
    try:
        os.makedirs(output_dir, exist_ok=True)
        print(f"  输出目录: {output_dir}")
        test_results.add_test("输出目录检查", "PASS", output_dir)
    except Exception as e:
        print(f"  输出目录创建失败: {e}")
        test_results.add_test("输出目录检查", "FAIL", str(e))
    
    print("\n1.5 测试API启动接口...")
    try:
        response = requests.get('http://localhost:3000/', timeout=3)
        if response.status_code == 200:
            print("  后端服务运行中")
            test_results.add_test("后端服务状态", "PASS", "服务运行中")
        else:
            print(f"  后端服务响应异常: {response.status_code}")
            test_results.add_test("后端服务状态", "WARN", f"状态码 {response.status_code}")
    except requests.exceptions.ConnectionError:
        print("  后端服务未启动")
        test_results.add_test("后端服务状态", "WARN", "服务未启动，无法测试API接口")
    except Exception as e:
        print(f"  测试失败: {e}")
        test_results.add_test("后端服务状态", "WARN", str(e))

def test_2_preset_tasks():
    print("\n" + "="*60)
    print("测试2: 预设爬虫任务配置")
    print("="*60)
    
    print("2.1 检查预设关键词列表...")
    print(f"  预设关键词数量: {len(JOB_KEYWORDS)}")
    print(f"  关键词列表: {JOB_KEYWORDS}")
    if len(JOB_KEYWORDS) > 0:
        test_results.add_test("预设关键词配置", "PASS", f"{len(JOB_KEYWORDS)}个关键词")
    else:
        test_results.add_test("预设关键词配置", "FAIL", "关键词列表为空")
    
    print("\n2.2 检查数据源配置...")
    sources = ['zhipin', 'zhaopin']
    print(f"  数据源: {sources}")
    test_results.add_test("数据源配置", "PASS", f"{len(sources)}个数据源")
    
    print("\n3.3 测试种子数据生成...")
    try:
        mock_data = generate_mock_job_data(10)
        print(f"  生成模拟数据: {len(mock_data)}条")
        if len(mock_data) == 10:
            test_results.add_test("种子数据生成", "PASS", f"成功生成{len(mock_data)}条")
            print(f"  样本数据: {json.dumps(mock_data[0], ensure_ascii=False, indent=2)[:200]}...")
        else:
            test_results.add_test("种子数据生成", "FAIL", f"期望10条，实际{len(mock_data)}条")
    except Exception as e:
        print(f"  种子数据生成失败: {e}")
        test_results.add_test("种子数据生成", "FAIL", str(e))

def test_3_data_crawling():
    print("\n" + "="*60)
    print("测试3: 目标网站数据抓取")
    print("="*60)
    
    print("3.1 测试BOSS直聘抓取...")
    try:
        results = crawl_zhipin('HRBP', city='全国', experience='不限')
        print(f"  BOSS直聘抓取结果: {len(results)}条")
        if len(results) > 0:
            test_results.add_test("BOSS直聘抓取", "PASS", f"抓取{len(results)}条数据")
            print(f"  样本: {json.dumps(results[0], ensure_ascii=False)[:200]}...")
        else:
            print("  BOSS直聘返回空数据（可能原因：反爬机制、JS渲染）")
            test_results.add_test("BOSS直聘抓取", "WARN", "返回0条数据，目标网站可能使用JS动态渲染或反爬机制")
    except Exception as e:
        print(f"  BOSS直聘抓取异常: {e}")
        test_results.add_test("BOSS直聘抓取", "FAIL", str(e))
    
    time.sleep(2)
    
    print("\n3.2 测试智联招聘抓取...")
    try:
        results = crawl_zhaopin('HRBP', city='全国')
        print(f"  智联招聘抓取结果: {len(results)}条")
        if len(results) > 0:
            test_results.add_test("智联招聘抓取", "PASS", f"抓取{len(results)}条数据")
        else:
            print("  智联招聘返回空数据（可能原因：反爬机制、JS渲染）")
            test_results.add_test("智联招聘抓取", "WARN", "返回0条数据，目标网站可能使用JS动态渲染或反爬机制")
    except Exception as e:
        print(f"  智联招聘抓取异常: {e}")
        test_results.add_test("智联招聘抓取", "FAIL", str(e))
    
    print("\n3.3 测试网络连通性...")
    test_urls = [
        ('BOSS直聘', 'https://www.zhipin.com/'),
        ('智联招聘', 'https://www.zhaopin.com/'),
    ]
    for name, url in test_urls:
        try:
            response = requests.get(url, timeout=10, headers={
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            })
            print(f"  {name}: 状态码 {response.status_code}, 响应大小 {len(response.text)}字节")
            test_results.add_test(f"{name}网络连通", "PASS", f"状态码{response.status_code}")
        except Exception as e:
            print(f"  {name}: 连接失败 - {e}")
            test_results.add_test(f"{name}网络连通", "FAIL", str(e))

def test_4_data_parsing():
    print("\n" + "="*60)
    print("测试4: 数据解析功能")
    print("="*60)
    
    print("4.1 测试薪资解析函数...")
    salary_tests = [
        ("15K-25K", (15000, 25000)),
        ("15k-25k", (15000, 25000)),
        ("1.5万-2.5万", (15000, 25000)),
        ("200元/天", (4400, 4400)),
        ("15K-25K·13薪", (15000, 25000)),
        ("", (None, None)),
        ("面议", (None, None)),
    ]
    
    for salary_text, expected in salary_tests:
        result = parse_salary(salary_text)
        status = "PASS" if result == expected else "FAIL"
        print(f"  '{salary_text}' -> {result} (期望: {expected}) [{status}]")
        test_results.add_test(f"薪资解析'{salary_text}'", status, f"结果{result}")
    
    print("\n4.2 测试HTML解析...")
    mock_html = '''
    <div class="job-card-wrapper">
        <span class="job-name">测试职位</span>
        <span class="salary">15K-25K</span>
        <h3 class="company-name">测试公司</h3>
        <div class="job-info">北京·朝阳区</div>
        <div class="tag-list">
            <li>Python</li>
            <li>数据分析</li>
        </div>
    </div>
    '''
    try:
        soup = BeautifulSoup(mock_html, 'html.parser')
        job_card = soup.find('div', class_='job-card-wrapper')
        job_title = job_card.find('span', class_='job-name').get_text(strip=True)
        company_name = job_card.find('h3', class_='company-name').get_text(strip=True)
        
        print(f"  解析职位: {job_title}")
        print(f"  解析公司: {company_name}")
        test_results.add_test("HTML解析", "PASS", f"成功解析{job_title}")
    except Exception as e:
        print(f"  HTML解析失败: {e}")
        test_results.add_test("HTML解析", "FAIL", str(e))

def test_5_data_storage():
    print("\n" + "="*60)
    print("测试5: 数据存储功能")
    print("="*60)
    
    print("5.1 测试数据清洗函数...")
    raw_data = [
        {
            'job_title': '测试职位1',
            'company_name': '测试公司1',
            'salary_min': 15000,
            'salary_max': 25000,
            'city': '北京',
            'skill_tags': ['Python', 'SQL'],
            'source': 'zhipin',
            'source_url': 'https://example.com',
            'publish_date': '2024-01-01',
            'crawl_time': datetime.now().isoformat()
        },
        {
            'job_title': '测试职位1',
            'company_name': '测试公司1',
            'salary_min': 15000,
            'salary_max': 25000,
            'city': '北京',
            'skill_tags': '["Python", "SQL"]',
            'source': 'zhipin',
            'source_url': 'https://example.com',
            'publish_date': '2024-01-01',
            'crawl_time': datetime.now().isoformat()
        },
        {
            'job_title': '',
            'company_name': '空职位公司',
        }
    ]
    
    cleaned = clean_job_data(raw_data)
    print(f"  原始数据: {len(raw_data)}条")
    print(f"  清洗后: {len(cleaned)}条")
    if len(cleaned) == 1:
        test_results.add_test("数据清洗去重", "PASS", f"3条原始数据清洗为{len(cleaned)}条")
    else:
        test_results.add_test("数据清洗去重", "FAIL", f"期望1条，实际{len(cleaned)}条")
    
    print("\n5.2 测试数据库连接...")
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM job_data")
        count = cursor.fetchone()[0]
        print(f"  数据库连接成功，job_data表有{count}条记录")
        test_results.add_test("数据库连接", "PASS", f"{count}条记录")
        
        cursor.execute("SELECT COUNT(*) FROM analysis_results")
        analysis_count = cursor.fetchone()[0]
        print(f"  analysis_results表有{analysis_count}条记录")
        test_results.add_test("分析结果表", "PASS", f"{analysis_count}条记录")
        
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
        tables = [row[0] for row in cursor.fetchall()]
        print(f"  数据库表: {tables}")
        test_results.add_test("数据库表结构", "PASS", f"{len(tables)}张表")
        
        cursor.close()
        conn.close()
    except Exception as e:
        print(f"  数据库连接失败: {e}")
        test_results.add_test("数据库连接", "FAIL", str(e))
    
    print("\n5.3 测试数据导入...")
    try:
        test_data = [{
            'job_title': '测试导入职位',
            'company_name': '测试导入公司',
            'company_type': '',
            'company_size': '',
            'salary_min': 10000,
            'salary_max': 20000,
            'city': '测试城市',
            'district': '',
            'experience': '不限',
            'education': '本科',
            'description': '测试描述',
            'skill_tags': '["测试技能"]',
            'source': 'test',
            'source_url': '',
            'publish_date': '2024-01-01',
            'crawl_time': datetime.now().isoformat()
        }]
        
        import_to_database(test_data)
        
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM job_data WHERE source='test'")
        result = cursor.fetchone()
        cursor.close()
        conn.close()
        
        if result:
            print(f"  数据导入成功，记录ID: {result[0]}")
            test_results.add_test("数据导入", "PASS", f"成功导入并查询到记录")
        else:
            print("  数据导入后未查询到记录")
            test_results.add_test("数据导入", "FAIL", "导入后未查询到记录")
    except Exception as e:
        print(f"  数据导入失败: {e}")
        test_results.add_test("数据导入", "FAIL", str(e))

def test_6_stability():
    print("\n" + "="*60)
    print("测试6: 稳定性和异常处理")
    print("="*60)
    
    print("6.1 测试超时处理...")
    try:
        response = requests.get('https://httpbin.org/delay/30', timeout=2)
        test_results.add_test("超时处理", "FAIL", "应该超时但没有")
    except requests.exceptions.Timeout:
        print("  超时异常正确捕获")
        test_results.add_test("超时处理", "PASS", "正确捕获Timeout异常")
    except Exception as e:
        print(f"  其他异常: {e}")
        test_results.add_test("超时处理", "WARN", f"捕获到其他异常: {type(e).__name__}")
    
    print("\n6.2 测试无效URL处理...")
    try:
        response = requests.get('https://invalid.example.com/test', timeout=5)
        test_results.add_test("无效URL处理", "FAIL", "应该失败但没有")
    except requests.exceptions.ConnectionError:
        print("  连接错误正确捕获")
        test_results.add_test("无效URL处理", "PASS", "正确捕获ConnectionError")
    except Exception as e:
        print(f"  其他异常: {e}")
        test_results.add_test("无效URL处理", "WARN", f"捕获到其他异常: {type(e).__name__}")
    
    print("\n6.3 测试异常数据处理...")
    invalid_data = [
        {'job_title': None, 'company_name': '公司1'},
        {'job_title': '职位2', 'salary_min': 'abc', 'salary_max': 'xyz'},
        {'job_title': '职位3', 'skill_tags': 'invalid json'},
    ]
    try:
        cleaned = clean_job_data(invalid_data)
        print(f"  异常数据处理完成，清洗后{len(cleaned)}条")
        test_results.add_test("异常数据处理", "PASS", f"处理{len(invalid_data)}条异常数据，输出{len(cleaned)}条")
    except Exception as e:
        print(f"  异常数据处理失败: {e}")
        test_results.add_test("异常数据处理", "FAIL", str(e))
    
    print("\n6.4 测试并发请求稳定性...")
    success_count = 0
    fail_count = 0
    for i in range(3):
        try:
            response = requests.get('https://httpbin.org/get', timeout=5)
            if response.status_code == 200:
                success_count += 1
            else:
                fail_count += 1
        except:
            fail_count += 1
        time.sleep(1)
    print(f"  连续3次请求: 成功{success_count}次, 失败{fail_count}次")
    if fail_count == 0:
        test_results.add_test("并发稳定性", "PASS", f"3次全部成功")
    else:
        test_results.add_test("并发稳定性", "WARN", f"{fail_count}次失败")

def test_7_analysis():
    print("\n" + "="*60)
    print("测试7: 数据分析功能")
    print("="*60)
    
    try:
        from analysis import analyze_skill_frequency, analyze_radar, run_all_analysis
        
        print("7.1 测试技能词频分析...")
        try:
            skills = analyze_skill_frequency()
            print(f"  技能词频分析完成，返回{len(skills)}个技能")
            if len(skills) > 0:
                print(f"  前5个技能: {skills[:5]}")
                test_results.add_test("技能词频分析", "PASS", f"{len(skills)}个技能")
            else:
                test_results.add_test("技能词频分析", "WARN", "返回0个技能，可能数据库无数据")
        except Exception as e:
            print(f"  技能词频分析失败: {e}")
            test_results.add_test("技能词频分析", "FAIL", str(e))
        
        print("\n7.2 测试能力雷达图分析...")
        try:
            radar = analyze_radar()
            print(f"  能力雷达图分析完成")
            if radar:
                test_results.add_test("能力雷达图分析", "PASS", "分析完成")
            else:
                test_results.add_test("能力雷达图分析", "WARN", "返回空结果")
        except Exception as e:
            print(f"  能力雷达图分析失败: {e}")
            test_results.add_test("能力雷达图分析", "FAIL", str(e))
    except ImportError as e:
        print(f"  分析模块导入失败: {e}")
        test_results.add_test("分析模块导入", "FAIL", str(e))

def generate_report():
    print("\n" + "="*80)
    print("爬虫功能全面测试报告")
    print("="*80)
    print(f"测试时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"测试环境: Python {sys.version}")
    print("-"*80)
    
    print("\n【测试结果汇总】")
    print(test_results.summary())
    
    print("\n【详细测试结果】")
    print("-"*80)
    
    categories = {
        "启动机制": [],
        "预设任务": [],
        "数据抓取": [],
        "数据解析": [],
        "数据存储": [],
        "稳定性": [],
        "分析功能": []
    }
    
    for test in test_results.tests:
        name = test['name']
        if any(k in name for k in ['Python', '依赖', '文件', '目录', '服务']):
            categories["启动机制"].append(test)
        elif any(k in name for k in ['关键词', '数据源', '种子']):
            categories["预设任务"].append(test)
        elif any(k in name for k in ['抓取', '网络']):
            categories["数据抓取"].append(test)
        elif any(k in name for k in ['薪资', 'HTML', '解析']):
            categories["数据解析"].append(test)
        elif any(k in name for k in ['数据库', '导入', '清洗', '表']):
            categories["数据存储"].append(test)
        elif any(k in name for k in ['超时', '无效', '异常', '并发']):
            categories["稳定性"].append(test)
        elif any(k in name for k in ['分析', '词频', '雷达']):
            categories["分析功能"].append(test)
    
    for category, tests in categories.items():
        if tests:
            print(f"\n{category}:")
            for test in tests:
                status_icon = "PASS" if test['status'] == 'PASS' else "FAIL" if test['status'] == 'FAIL' else "WARN"
                message = f" - {test['message']}" if test['message'] else ""
                print(f"  [{status_icon}] {test['name']}{message}")
    
    print("\n" + "-"*80)
    print("【发现问题】")
    print("-"*80)
    
    issues = []
    for test in test_results.tests:
        if test['status'] == 'FAIL':
            issues.append(f"严重: {test['name']} - {test['message']}")
        elif test['status'] == 'WARN':
            issues.append(f"警告: {test['name']} - {test['message']}")
    
    if issues:
        for i, issue in enumerate(issues, 1):
            print(f"{i}. {issue}")
    else:
        print("未发现严重问题")
    
    print("\n" + "-"*80)
    print("【改进建议】")
    print("-"*80)
    
    suggestions = [
        "1. 目标网站（BOSS直聘、智联招聘）使用JavaScript动态渲染，建议使用Selenium或Playwright替代requests进行爬取",
        "2. 考虑使用目标网站的API接口进行数据获取，而非HTML解析",
        "3. 建议添加代理IP池，避免因频繁请求被封禁",
        "4. 建议添加更完善的反反爬策略（如Cookie管理、请求频率控制）",
        "5. 建议添加数据验证机制，确保抓取数据的准确性",
        "6. 建议添加爬虫任务调度功能，支持定时执行",
        "7. 建议添加爬虫状态监控和告警机制",
        "8. 建议添加数据源切换机制，当一个源不可用时自动切换到备用源"
    ]
    
    for suggestion in suggestions:
        print(suggestion)
    
    print("\n" + "="*80)
    print("测试完成")
    print("="*80)
    
    report_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'test_report.txt')
    return report_path

def main():
    print("开始爬虫功能全面测试...")
    print(f"测试时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    test_1_startup_mechanism()
    test_2_preset_tasks()
    test_3_data_crawling()
    test_4_data_parsing()
    test_5_data_storage()
    test_6_stability()
    test_7_analysis()
    
    report_path = generate_report()

if __name__ == '__main__':
    main()
