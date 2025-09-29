import csv
import json
import os

def convert_csv_to_json():
    # 文件路径
    csv_file_path = '湾子课程数据表.csv'
    json_file_path = 'data/courses.json'
    
    # 确保 data 目录存在
    os.makedirs('data', exist_ok=True)
    
    courses = []
    
    try:
        # 尝试不同的编码方式
        encodings = ['utf-8-sig', 'gbk', 'utf-8']
        
        for encoding in encodings:
            try:
                with open(csv_file_path, 'r', encoding=encoding) as csvfile:
                    # 使用 DictReader 读取 CSV
                    reader = csv.DictReader(csvfile)
                    
                    # 检查列名
                    print("CSV 列名:", reader.fieldnames)
                    
                    for row_id, row in enumerate(reader):
                        # 检查音频和文本文件是否存在
                        audio_file = f"audio/{row['音频文件名']}"
                        text_file = f"text/{row['文本文件名']}"
                        
                        course = {
                            "id": row_id,
                            "书籍ID": row.get('书籍ID', ''),
                            "书名": row.get('书名', ''),
                            "音频文件名": row['音频文件名'],
                            "文本文件名": row['文本文件名'],
                            "单元标题": row['单元标题'],
                            "关键词": row.get('关键词', ''),
                            "关键句子": row.get('关键句子', ''),
                            "audio_exists": os.path.exists(audio_file),
                            "text_exists": os.path.exists(text_file)
                        }
                        courses.append(course)
                    
                    print(f"成功使用 {encoding} 编码读取CSV文件")
                    break
                    
            except UnicodeDecodeError:
                print(f"{encoding} 编码失败，尝试下一种编码...")
                continue
            except Exception as e:
                print(f"使用 {encoding} 编码时出错: {e}")
                continue
        
        # 写入 JSON 文件
        with open(json_file_path, 'w', encoding='utf-8') as jsonfile:
            json.dump(courses, jsonfile, ensure_ascii=False, indent=2)
        
        print(f"成功转换 {len(courses)} 个课程到 {json_file_path}")
        
        # 统计信息
        audio_exists_count = sum(1 for course in courses if course['audio_exists'])
        text_exists_count = sum(1 for course in courses if course['text_exists'])
        print(f"音频文件存在: {audio_exists_count}/{len(courses)}")
        print(f"文本文件存在: {text_exists_count}/{len(courses)}")
        
        # 列出缺失的文件
        missing_audio = [course['音频文件名'] for course in courses if not course['audio_exists']]
        missing_text = [course['文本文件名'] for course in courses if not course['text_exists']]
        
        if missing_audio:
            print("缺失的音频文件:", missing_audio)
        if missing_text:
            print("缺失的文本文件:", missing_text)
            
    except Exception as e:
        print(f"转换过程中出错: {e}")

if __name__ == "__main__":
    convert_csv_to_json()