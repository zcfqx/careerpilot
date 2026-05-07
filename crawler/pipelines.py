import json
import os
import sqlite3
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'backend', 'data', 'ai_career.db')

RAW_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'output', 'raw')


def clean_job_data(raw_data):
    cleaned = []
    seen = set()

    for item in raw_data:
        job_title = (item.get('job_title') or '').strip()
        if not job_title:
            continue

        company_name = (item.get('company_name') or '').strip()
        source = (item.get('source') or '').strip()

        key = f"{job_title}_{company_name}_{source}"
        if key in seen:
            continue
        seen.add(key)

        skill_tags = item.get('skill_tags', [])
        if isinstance(skill_tags, str):
            try:
                skill_tags = json.loads(skill_tags)
            except:
                skill_tags = [s.strip() for s in skill_tags.split(',') if s.strip()]

        salary_min = item.get('salary_min')
        salary_max = item.get('salary_max')
        if salary_min is not None:
            try:
                salary_min = int(salary_min)
            except (ValueError, TypeError):
                salary_min = 0
        else:
            salary_min = 0
        if salary_max is not None:
            try:
                salary_max = int(salary_max)
            except (ValueError, TypeError):
                salary_max = 0
        else:
            salary_max = 0

        cleaned.append({
            'job_title': job_title,
            'company_name': company_name,
            'salary_min': salary_min,
            'salary_max': salary_max,
            'city': (item.get('city') or '').strip(),
            'experience': (item.get('experience') or '').strip(),
            'education': (item.get('education') or '').strip(),
            'description': (item.get('description') or '').strip(),
            'skill_tags': json.dumps(skill_tags, ensure_ascii=False),
            'source': source,
            'source_url': (item.get('source_url') or '').strip(),
            'publish_date': (item.get('publish_date') or '').strip(),
            'crawl_time': item.get('crawl_time') or datetime.now().isoformat()
        })

    return cleaned


def import_to_database(cleaned_data):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    insert_sql = """
    INSERT INTO job_data (job_title, company_name, salary_min, salary_max,
        city, experience, education, description, skill_tags,
        source, source_url, publish_date, crawl_time)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """

    success_count = 0
    for item in cleaned_data:
        try:
            cursor.execute(insert_sql, (
                item['job_title'], item['company_name'],
                item['salary_min'], item['salary_max'],
                item['city'], item['experience'], item['education'],
                item['description'], item['skill_tags'], item['source'],
                item['source_url'], item['publish_date'], item['crawl_time']
            ))
            success_count += 1
        except Exception as e:
            print(f"插入失败: {item['job_title']} - {e}")

    conn.commit()
    cursor.close()
    conn.close()

    print(f"[数据导入] 成功导入 {success_count}/{len(cleaned_data)} 条数据")


def process_latest_data():
    if not os.path.exists(RAW_DIR):
        print("[数据处理] 没有找到原始数据目录")
        return

    files = [f for f in os.listdir(RAW_DIR) if f.endswith('.json')]
    if not files:
        print("[数据处理] 没有找到原始数据文件")
        return

    latest_file = os.path.join(RAW_DIR, sorted(files)[-1])
    print(f"[数据处理] 处理文件: {latest_file}")

    with open(latest_file, 'r', encoding='utf-8') as f:
        raw_data = json.load(f)

    cleaned = clean_job_data(raw_data)
    print(f"[数据处理] 清洗后数据: {len(cleaned)} 条")

    processed_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'output', 'processed')
    os.makedirs(processed_dir, exist_ok=True)
    processed_file = os.path.join(processed_dir, f'cleaned_{datetime.now().strftime("%Y%m%d_%H%M%S")}.json')
    with open(processed_file, 'w', encoding='utf-8') as f:
        json.dump(cleaned, f, ensure_ascii=False, indent=2)

    import_to_database(cleaned)


if __name__ == '__main__':
    process_latest_data()