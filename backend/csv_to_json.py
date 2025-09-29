import csv
import json
import os

# 配置文件
CSV_FILE = r"D:\wanzi\湾子课程数据表.csv"
JSON_FILE = r"D:\wanzi\weixin_english_app\backend\courses.json"
AUDIO_PATH = r"D:\wanzi\weixin_english_app\audio"
TEXT_PATH = r"D:\wanzi\weixin_english_app\book"

def convert_csv_to_json():
    """将CSV文件转换为JSON格式"""
    courses = []
    
    try:
        with open(CSV_FILE, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            
            for i, row in enumerate(reader):
                print(f"原始行 {i}: {dict(row)}")
                
                # 直接从CSV读取，不进行任何处理
                audio_file = row.get('音频文件名', '')
                text_file = row.get('文本文件名', '')
                title = row.get('单元标题', '')
                
                # 检查文件实际存在情况
                audio_exists = os.path.exists(os.path.join(AUDIO_PATH, audio_file)) if audio_file else False
                text_exists = os.path.exists(os.path.join(TEXT_PATH, text_file)) if text_file else False
                
                course = {
                    'id': i,
                    '书籍ID': row.get('书籍ID', ''),
                    '书名': row.get('书名', ''),
                    '音频文件名': audio_file,
                    '文本文件名': text_file,
                    '单元标题': title,
                    '关键词': row.get('关键词', ''),
                    '关键句子': row.get('关键句子', ''),
                    'audio_exists': audio_exists,
                    'text_exists': text_exists
                }
                
                print(f"处理后的课程 {i}: {course}")
                courses.append(course)
        
        # 保存为JSON文件
        with open(JSON_FILE, 'w', encoding='utf-8') as f:
            json.dump(courses, f, ensure_ascii=False, indent=2)
        
        print(f"转换成功！共 {len(courses)} 个课程")
        print(f"JSON文件保存到: {JSON_FILE}")
        
        # 显示统计信息
        audio_count = sum(1 for course in courses if course['audio_exists'])
        text_count = sum(1 for course in courses if course['text_exists'])
        print(f"音频文件存在: {audio_count}/{len(courses)}")
        print(f"文本文件存在: {text_count}/{len(courses)}")
        
    except Exception as e:
        print(f"转换错误: {e}")

if __name__ == '__main__':
    convert_csv_to_json()