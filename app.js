// app.js - 完整版本（包含翻译功能）

// 全局变量来存储当前状态
let currentCourse = null;
let coursesData = []; // 用于存储从 courses.json 加载的课程数据
let currentSentenceIndex = -1;
let translationVisible = true;

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log('页面加载完成，开始初始化...');
    // 首先加载课程数据
    loadCoursesData();
    // 初始化翻译功能
    initTranslation();
});

// 从 courses.json 加载课程数据
async function loadCoursesData() {
    try {
        console.log('开始加载课程数据...');
        const response = await fetch('data/courses.json');
        if (!response.ok) {
            throw new Error('无法加载课程数据');
        }
        coursesData = await response.json();
        
        console.log('成功加载课程数据，数量:', coursesData.length);
        
        // 检查第一个课程的数据
        if (coursesData.length > 0) {
            console.log('第一个课程样例:', coursesData[0]);
        }
        
        // 数据加载成功后，初始化课程列表
        initCourseList();
    } catch (error) {
        console.error('加载课程数据时出错:', error);
        alert('加载课程数据失败，请检查控制台获取详细信息。');
    }
}

// 初始化课程列表
function initCourseList() {
    const courseListElement = document.getElementById('course-list');
    
    // 清空现有列表
    courseListElement.innerHTML = '';
    
    console.log('初始化课程列表，课程数量:', coursesData.length);
    
    // 为每个课程创建列表项
    coursesData.forEach((course, index) => {
        const listItem = document.createElement('li');
        listItem.className = 'course-item';
        listItem.textContent = course.单元标题 || `课程 ${course.音频文件名}`;
        
        // 添加点击事件
        listItem.addEventListener('click', () => {
            console.log('点击课程:', course);
            loadCourse(course);
        });
        
        courseListElement.appendChild(listItem);
    });
    
    // 更新课程计数
    document.getElementById('course-count').textContent = coursesData.length;
    console.log('课程列表初始化完成');
}

// 加载选中的课程
async function loadCourse(course) {
    console.log('开始加载课程:', course);
    currentCourse = course;
    
    // 重置高亮索引
    currentSentenceIndex = -1;
    
    // 更新当前课程标题
    document.getElementById('current-course-title').textContent = course.单元标题;
    
    // 更新音频播放器源
    const audioPlayer = document.getElementById('audio-player');
    const audioSource = `audio/${course.音频文件名}`;
    console.log('设置音频源:', audioSource);
    audioPlayer.src = audioSource;
    
    // 重置播放状态
    document.getElementById('play-pause-btn').textContent = '播放';
    
    // 加载并显示文本
    await loadCourseText(course);
    
    // 更新活跃的课程列表项
    updateActiveCourseItem(course);
    
    console.log('课程加载完成');
}

// 加载课程文本
async function loadCourseText(course) {
    try {
        const textFileName = course.文本文件名;
        const textPath = `text/${textFileName}`;
        console.log('加载文本路径:', textPath);
        
        const response = await fetch(textPath);
        
        if (!response.ok) {
            throw new Error('无法加载课程文本');
        }
        
        const text = await response.text();
        
        // 将文本分割成句子并格式化显示
        formatTextForHighlighting(text);
        console.log('文本加载并格式化成功');
    } catch (error) {
        console.error('加载课程文本时出错:', error);
        document.getElementById('course-text').textContent = '无法加载课程文本。';
    }
}

// 格式化文本用于高亮显示
function formatTextForHighlighting(text) {
    const textContainer = document.getElementById('course-text');
    textContainer.innerHTML = ''; // 清空原有内容
    
    // 简单的句子分割（按句号、问号、感叹号分割）
    const sentences = text.split(/(?<=[.!?])\s+/);
    
    sentences.forEach((sentence, index) => {
        if (sentence.trim() === '') return;
        
        const sentenceElement = document.createElement('div');
        sentenceElement.className = 'sentence';
        sentenceElement.dataset.index = index;
        
        // 将句子中的单词包装成可点击元素
        const words = sentence.split(/(\s+)/);
        words.forEach(word => {
            if (word.trim() === '') {
                sentenceElement.appendChild(document.createTextNode(word));
            } else if (/^[a-zA-Z]+$/.test(word)) {
                // 如果是纯英文单词，添加点击功能
                const wordSpan = document.createElement('span');
                wordSpan.className = 'word';
                wordSpan.textContent = word;
                sentenceElement.appendChild(wordSpan);
            } else {
                sentenceElement.appendChild(document.createTextNode(word));
            }
        });
        
        textContainer.appendChild(sentenceElement);
    });
}

// 更新活跃的课程列表项
function updateActiveCourseItem(activeCourse) {
    const allCourseItems = document.querySelectorAll('.course-item');
    
    allCourseItems.forEach(item => {
        item.classList.remove('active');
    });
    
    // 找到并激活当前课程对应的列表项
    allCourseItems.forEach(item => {
        if (item.textContent === activeCourse.单元标题) {
            item.classList.add('active');
        }
    });
}

// 播放/暂停按钮功能
document.getElementById('play-pause-btn').addEventListener('click', function() {
    const audioPlayer = document.getElementById('audio-player');
    
    if (audioPlayer.paused) {
        audioPlayer.play();
        this.textContent = '暂停';
    } else {
        audioPlayer.pause();
        this.textContent = '播放';
    }
});

// 监听音频播放结束，更新按钮状态
document.getElementById('audio-player').addEventListener('ended', function() {
    document.getElementById('play-pause-btn').textContent = '播放';
});

// 监听音频时间更新，实现句子高亮
document.getElementById('audio-player').addEventListener('timeupdate', function() {
    highlightCurrentSentence(this.currentTime);
});

// 高亮当前句子（简单版本 - 按顺序高亮）
function highlightCurrentSentence(currentTime) {
    const sentences = document.querySelectorAll('.sentence');
    const audioPlayer = document.getElementById('audio-player');
    
    // 简单实现：根据播放进度按顺序高亮
    if (sentences.length === 0) return;
    
    // 计算当前应该高亮的句子索引（基于播放进度）
    const progress = currentTime / audioPlayer.duration;
    const newIndex = Math.floor(progress * sentences.length);
    
    if (newIndex !== currentSentenceIndex && newIndex < sentences.length) {
        // 移除旧的高亮
        if (currentSentenceIndex >= 0 && currentSentenceIndex < sentences.length) {
            sentences[currentSentenceIndex].classList.remove('active');
        }
        
        // 添加新的高亮
        sentences[newIndex].classList.add('active');
        currentSentenceIndex = newIndex;
        
        // 自动滚动到当前句子
        scrollToCurrentSentence(sentences[newIndex]);
    }
}

// 自动滚动到当前句子
function scrollToCurrentSentence(sentenceElement) {
    const textSection = document.querySelector('.text-section');
    const sentenceRect = sentenceElement.getBoundingClientRect();
    const textSectionRect = textSection.getBoundingClientRect();
    
    // 如果句子不在可视区域内，滚动到句子位置
    if (sentenceRect.top < textSectionRect.top || sentenceRect.bottom > textSectionRect.bottom) {
        sentenceElement.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        });
    }
}

// ========== 翻译功能 ==========

// 初始化翻译功能
function initTranslation() {
    // 监听文本区域点击事件
    document.getElementById('course-text').addEventListener('click', handleTextClick);
    
    // 关闭翻译弹层
    document.getElementById('close-translation').addEventListener('click', closeTranslation);
    
    // 隐藏/显示翻译
    document.getElementById('toggle-translation').addEventListener('click', toggleTranslation);
    
    // 加入生词本
    document.getElementById('add-to-vocab').addEventListener('click', addToVocabulary);
    
    console.log('翻译功能初始化完成');
}

// 处理文本点击事件
function handleTextClick(event) {
    const clickedElement = event.target;
    
    if (clickedElement.classList.contains('word')) {
        const word = clickedElement.textContent;
        showTranslation(word, clickedElement);
    }
}

// 显示翻译
function showTranslation(word, element) {
    // 高亮点击的单词
    document.querySelectorAll('.word').forEach(w => w.classList.remove('highlighted'));
    element.classList.add('highlighted');
    
    // 显示单词
    document.getElementById('word-original').textContent = word;
    
    // 获取翻译
    const translation = getTranslation(word);
    document.getElementById('word-translation').textContent = translation;
    
    // 显示弹层
    document.getElementById('translation-modal').classList.add('active');
    
    console.log('显示单词翻译:', word, translation);
}

// 关闭翻译
function closeTranslation() {
    document.getElementById('translation-modal').classList.remove('active');
    document.querySelectorAll('.word').forEach(w => w.classList.remove('highlighted'));
}

// 切换翻译显示
function toggleTranslation() {
    translationVisible = !translationVisible;
    const translationElement = document.getElementById('word-translation');
    const button = document.getElementById('toggle-translation');
    
    if (translationVisible) {
        translationElement.style.display = 'inline';
        button.textContent = '隐藏翻译';
    } else {
        translationElement.style.display = 'none';
        button.textContent = '显示翻译';
    }
}

// 模拟翻译函数
function getTranslation(word) {
    // 这里是一个简单的模拟词典
    const dictionary = {
        'hello': '你好',
        'world': '世界',
        'english': '英语',
        'learn': '学习',
        'student': '学生',
        'teacher': '老师',
        'book': '书',
        'pen': '钢笔',
        'school': '学校',
        'friend': '朋友',
        'good': '好',
        'morning': '早上',
        'afternoon': '下午',
        'evening': '晚上',
        'night': '夜晚',
        'how': '如何',
        'what': '什么',
        'where': '哪里',
        'when': '何时',
        'why': '为什么',
        'who': '谁'
    };
    
    const cleanWord = word.toLowerCase().replace(/[^a-zA-Z]/g, '');
    return dictionary[cleanWord] || '翻译加载中...（点击"加入生词本"可记录生词）';
}

// 加入生词本
function addToVocabulary() {
    const word = document.getElementById('word-original').textContent;
    const translation = document.getElementById('word-translation').textContent;
    
    // 这里先简单alert，后续实现生词本功能
    alert(`已添加 "${word}" 到生词本\n${word} - ${translation}`);
    console.log('添加到生词本:', word, translation);
}

// 变速播放功能
document.querySelectorAll('.speed-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        const speed = parseFloat(this.dataset.speed);
        setPlaybackSpeed(speed);
        
        // 更新按钮活跃状态
        document.querySelectorAll('.speed-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
    });
});

function setPlaybackSpeed(speed) {
    const audioPlayer = document.getElementById('audio-player');
    audioPlayer.playbackRate = speed;
    console.log('设置播放速度:', speed);
}