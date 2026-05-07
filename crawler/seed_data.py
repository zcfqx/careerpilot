import json
import sqlite3
import random
from datetime import datetime, timedelta
import os

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'backend', 'data', 'ai_career.db')

JOB_TITLES = ['HRBP', '运营经理', '项目经理', '市场经理', '行政经理', '产品经理', '数据分析师', '商务经理', '采购经理', '客服经理']

COMPANIES = [
    '字节跳动', '阿里巴巴', '腾讯', '美团', '京东', '百度', '网易', '小米', '华为', '联想',
    '中国银行', '工商银行', '中国移动', '中国电信', '国家电网',
    '微软中国', '苹果中国', '谷歌中国', '亚马逊中国', '宝洁中国',
    '某科技有限公司', '某互联网公司', '某咨询公司', '某教育集团', '某医疗集团'
]

CITIES = ['北京', '上海', '广州', '深圳', '杭州', '成都', '武汉', '南京', '苏州', '长沙']

EXPERIENCES = ['应届生', '不限经验', '1-3年', '3-5年', '1年以内']

EDUCATIONS = ['本科', '硕士', '大专', '不限']

SKILL_MAP = {
    'HRBP': ['数据分析', 'AI招聘工具', '沟通协作', '组织诊断', '人才发展', 'Excel', 'PPT', '跨部门协调', '绩效管理', '员工关系'],
    '运营经理': ['数据分析', 'SQL', '用户增长', 'A/B测试', '内容运营', '活动策划', '项目管理', '数据可视化', 'Excel', 'AI工具使用'],
    '项目经理': ['项目管理', 'PMP', '敏捷开发', '风险管理', '沟通协调', '需求分析', '甘特图', 'JIRA', '跨部门协作', '预算管理'],
    '市场经理': ['市场分析', '品牌管理', '数字营销', 'SEO/SEM', '社交媒体', '内容策划', '数据分析', 'AI营销工具', '广告投放', '竞品分析'],
    '行政经理': ['办公软件', '流程管理', '资产管理', '会议组织', '公文写作', '沟通协调', '预算管理', '供应商管理', 'Excel', 'PPT'],
    '产品经理': ['需求分析', '原型设计', 'Axure', '数据分析', '用户研究', '项目管理', 'SQL', 'A/B测试', 'AI产品设计', '竞品分析'],
    '数据分析师': ['SQL', 'Python', 'Excel', '数据可视化', 'Tableau', '统计分析', '机器学习', 'R语言', '数据挖掘', 'AI工具使用'],
    '商务经理': ['商务谈判', '合同管理', '客户关系', '市场分析', '项目管理', '沟通表达', 'PPT', '数据分析', 'CRM', '跨部门协作'],
    '采购经理': ['供应商管理', '成本控制', '合同谈判', '供应链管理', '数据分析', 'ERP', '风险管理', '跨部门协作', 'Excel', '项目管理'],
    '客服经理': ['客户关系', '团队管理', '数据分析', 'CRM系统', '投诉处理', '流程优化', 'AI客服工具', '沟通表达', 'Excel', '培训管理']
}

SALARY_MAP = {
    'HRBP': (12000, 30000),
    '运营经理': (15000, 35000),
    '项目经理': (18000, 40000),
    '市场经理': (15000, 35000),
    '行政经理': (10000, 25000),
    '产品经理': (20000, 45000),
    '数据分析师': (15000, 35000),
    '商务经理': (15000, 35000),
    '采购经理': (12000, 28000),
    '客服经理': (10000, 22000)
}

DESCRIPTIONS = {
    'HRBP': '负责业务部门的人力资源支持，包括人才招聘、绩效管理、员工发展等。需要具备数据分析能力，能够使用AI工具提升招聘效率，推动组织变革与发展。',
    '运营经理': '负责产品运营策略制定与执行，通过数据驱动优化运营流程。需要具备用户增长、内容运营、活动策划等能力，能够使用AI工具辅助决策。',
    '项目经理': '负责项目全生命周期管理，包括需求分析、进度跟踪、风险管控。需要具备跨部门协调能力，能够使用项目管理工具推动项目落地。',
    '市场经理': '负责品牌推广与市场营销策略，包括数字营销、内容策划、广告投放。需要具备数据分析能力，能够使用AI工具优化营销效果。',
    '行政经理': '负责公司行政管理体系建设，包括办公环境、资产管理、流程优化。需要具备良好的沟通协调能力，能够使用数字化工具提升行政效率。'
}


def generate_mock_job_data(count=200):
    jobs = []
    for i in range(count):
        job_title = random.choice(JOB_TITLES)
        salary_range = SALARY_MAP.get(job_title, (10000, 25000))
        salary_min = random.randint(salary_range[0], salary_range[1] - 5000)
        salary_max = random.randint(salary_min + 3000, salary_range[1])
        skills = random.sample(SKILL_MAP.get(job_title, ['沟通', '协作', 'Excel']), k=min(5, len(SKILL_MAP.get(job_title, []))))
        publish_date = (datetime.now() - timedelta(days=random.randint(1, 90))).strftime('%Y-%m-%d')

        job = {
            'job_title': job_title,
            'company_name': random.choice(COMPANIES),
            'salary_min': salary_min,
            'salary_max': salary_max,
            'city': random.choice(CITIES),
            'experience': random.choice(EXPERIENCES),
            'education': random.choice(EDUCATIONS),
            'description': DESCRIPTIONS.get(job_title, '负责相关业务的管理和执行工作，需要具备良好的沟通能力和团队协作精神。'),
            'skill_tags': json.dumps(skills, ensure_ascii=False),
            'source': random.choice(['zhipin', 'zhaopin', 'qiancheng']),
            'source_url': '',
            'publish_date': publish_date,
            'crawl_time': datetime.now().isoformat()
        }
        jobs.append(job)
    return jobs


def generate_analysis_data():
    skill_cloud_data = {'skills': []}
    all_skills = Counter()
    for skills in SKILL_MAP.values():
        for skill in skills:
            all_skills[skill] += random.randint(10, 50)
    skill_cloud_data['skills'] = [{'name': name, 'weight': count} for name, count in all_skills.most_common(30)]

    radar_data = {
        'dimensions': ['判断决策', 'AI工具使用', '跨域整合', '沟通协作', '数据分析', '创新思维'],
        'values': {}
    }
    for job_title in JOB_TITLES:
        radar_data['values'][job_title] = [random.randint(55, 95) for _ in range(6)]

    return skill_cloud_data, radar_data


from collections import Counter


def seed_database():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    print("[种子数据] 开始插入模拟数据...")

    cursor.execute("SELECT COUNT(*) FROM job_data")
    existing_count = cursor.fetchone()[0]
    if existing_count > 0:
        print(f"[种子数据] 数据库已有 {existing_count} 条岗位数据，跳过插入")
    else:
        jobs = generate_mock_job_data(200)
        insert_sql = """
        INSERT INTO job_data (job_title, company_name, salary_min, salary_max, city,
            experience, education, description, skill_tags, source, source_url, publish_date, crawl_time)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """
        for job in jobs:
            cursor.execute(insert_sql, (
                job['job_title'], job['company_name'], job['salary_min'], job['salary_max'],
                job['city'], job['experience'], job['education'], job['description'],
                job['skill_tags'], job['source'], job['source_url'], job['publish_date'], job['crawl_time']
            ))
        print(f"[种子数据] 插入 {len(jobs)} 条岗位数据")

    cursor.execute("SELECT COUNT(*) FROM analysis_results")
    existing_analysis = cursor.fetchone()[0]
    if existing_analysis > 0:
        print(f"[种子数据] 已有 {existing_analysis} 条分析数据，跳过插入")
    else:
        skill_cloud_data, radar_data = generate_analysis_data()

        cursor.execute(
            "INSERT INTO analysis_results (type, job_title, data) VALUES (?, ?, ?)",
            ('skill_cloud', None, json.dumps(skill_cloud_data, ensure_ascii=False))
        )
        cursor.execute(
            "INSERT INTO analysis_results (type, job_title, data) VALUES (?, ?, ?)",
            ('radar', None, json.dumps(radar_data, ensure_ascii=False))
        )
        print("[种子数据] 插入分析数据")

    conn.commit()
    cursor.close()
    conn.close()
    print("[种子数据] 数据初始化完成！")


if __name__ == '__main__':
    seed_database()