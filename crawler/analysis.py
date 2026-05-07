import json
import sqlite3
from collections import Counter
from datetime import datetime
import os

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'backend', 'data', 'ai_career.db')


def analyze_skill_frequency(job_title=None):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    if job_title:
        cursor.execute("SELECT skill_tags FROM job_data WHERE job_title = ? AND skill_tags IS NOT NULL", (job_title,))
    else:
        cursor.execute("SELECT skill_tags FROM job_data WHERE skill_tags IS NOT NULL")

    skill_count = Counter()
    for (tags_json,) in cursor.fetchall():
        try:
            tags = json.loads(tags_json) if isinstance(tags_json, str) else tags_json
            if isinstance(tags, list):
                for tag in tags:
                    skill_count[tag.strip()] += 1
        except:
            continue

    skills = [{'name': name, 'weight': count} for name, count in skill_count.most_common(50)]

    result_data = json.dumps({'skills': skills}, ensure_ascii=False)
    cursor.execute(
        "INSERT INTO analysis_results (type, job_title, data) VALUES (?, ?, ?)",
        ('skill_cloud', job_title, result_data)
    )

    conn.commit()
    cursor.close()
    conn.close()

    print(f"[分析] 技能词云分析完成，共 {len(skills)} 个技能")
    return skills


def analyze_radar(job_title=None):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    if job_title:
        cursor.execute("SELECT description FROM job_data WHERE job_title = ? AND description IS NOT NULL", (job_title,))
    else:
        cursor.execute("SELECT description FROM job_data WHERE description IS NOT NULL")

    dimensions = ['判断决策', 'AI工具使用', '跨域整合', '沟通协作', '数据分析', '创新思维']
    dimension_keywords = {
        '判断决策': ['决策', '判断', '战略', '规划', '分析', '评估'],
        'AI工具使用': ['AI', '人工智能', '大模型', '机器学习', '自动化', 'ChatGPT'],
        '跨域整合': ['跨部门', '整合', '协同', '综合', '多维度', '跨界'],
        '沟通协作': ['沟通', '协作', '协调', '团队', '表达', '谈判'],
        '数据分析': ['数据', 'SQL', 'Excel', '报表', '指标', '统计'],
        '创新思维': ['创新', '优化', '改进', '突破', '变革', '新方案']
    }

    job_scores = {}
    cursor.execute("SELECT DISTINCT job_title FROM job_data LIMIT 10")
    job_titles = [row[0] for row in cursor.fetchall()]

    for jt in job_titles:
        cursor.execute("SELECT description FROM job_data WHERE job_title = ? AND description IS NOT NULL", (jt,))
        descriptions = ' '.join([row[0] for row in cursor.fetchall()])

        scores = []
        for dim in dimensions:
            keywords = dimension_keywords[dim]
            count = sum(descriptions.count(kw) for kw in keywords)
            score = min(100, count * 5 + 40)
            scores.append(score)
        job_scores[jt] = scores

    result_data = json.dumps({
        'dimensions': dimensions,
        'values': job_scores
    }, ensure_ascii=False)

    cursor.execute(
        "INSERT INTO analysis_results (type, job_title, data) VALUES (?, ?, ?)",
        ('radar', job_title, result_data)
    )

    conn.commit()
    cursor.close()
    conn.close()

    print(f"[分析] 能力雷达图分析完成")
    return job_scores


def run_all_analysis():
    print("[分析] 开始数据分析...")
    analyze_skill_frequency()
    analyze_radar()
    print("[分析] 全部分析完成！")


if __name__ == '__main__':
    run_all_analysis()