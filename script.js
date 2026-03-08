

// 平滑滚动效果
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offsetTop = target.offsetTop - 80; // 考虑导航栏高度
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// 数字动画效果
function animateNumbers() {
    const numberElements = document.querySelectorAll('.stat-number:not(.animated):not(#server-run-time):not(#server-status)');
    
    numberElements.forEach(element => {
        // 添加标记，防止重复动画
        element.classList.add('animated');
        
        const target = parseInt(element.getAttribute('data-target'));
        const duration = 2000; // 动画持续时间
        const step = target / (duration / 16); // 每帧增加的数值
        let current = 0;
        
        const timer = setInterval(() => {
            current += step;
            if (current >= target) {
                element.textContent = target;
                clearInterval(timer);
            } else {
                element.textContent = Math.floor(current);
            }
        }, 16);
    });
}

// 服务器运行时间计时
function startServerRunTime() {
    const serverRunTimeElement = document.getElementById('server-run-time');
    if (!serverRunTimeElement) return;
    
    // 服务器启动时间：2024年1月1日凌晨1点
    const serverStartTime = new Date('2024-01-01T01:00:00');
    
    function updateRunTime() {
        // 检查服务器状态
        const statusElement = document.getElementById('server-status');
        // 检查服务器状态是否为在线（考虑可能的不同文本形式）
        const isServerOnline = statusElement && 
            (statusElement.textContent.trim() === '在线' || 
             statusElement.textContent.trim() === '在线');
        
        if (isServerOnline) {
            const now = new Date();
            const runTimeInSeconds = Math.floor((now - serverStartTime) / 1000);
            serverRunTimeElement.textContent = runTimeInSeconds;
        }
        // 如果服务器离线，不更新运行时间
    }
    
    // 立即更新一次
    updateRunTime();
    
    // 每秒更新一次
    setInterval(updateRunTime, 1000);
}

// 视差滚动效果
function handleParallax() {
    const parallaxElements = document.querySelectorAll('.parallax');
    const scrollPosition = window.pageYOffset;
    
    parallaxElements.forEach((element, index) => {
        const speed = parseFloat(element.getAttribute('data-speed') || '0.2');
        const yPos = -(scrollPosition * speed);
        element.style.transform = `translateY(${yPos}px)`;
    });
}

// 滚动时元素动画效果
function animateOnScroll() {
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    
    animatedElements.forEach((element, index) => {
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = 100;
        
        if (elementTop < window.innerHeight - elementVisible) {
            element.classList.add('animated');
            element.classList.add('fade-in');
            
            // 添加延迟效果
            const delay = index * 0.1;
            element.style.animationDelay = `${delay}s`;
        }
    });
}

// 监听滚动事件
let ticking = false;

function handleScrollEvent() {
    // 执行视差滚动效果
    handleParallax();
    
    // 执行元素动画
    animateOnScroll();
    
    // 当滚动到关于我们部分时，开始数字动画
    const aboutSection = document.querySelector('.about');
    if (aboutSection) {
        const aboutSectionTop = aboutSection.getBoundingClientRect().top;
        const aboutSectionVisible = 200;
        
        if (aboutSectionTop < window.innerHeight - aboutSectionVisible) {
            animateNumbers();
            // 移除事件监听器，避免重复执行
            window.removeEventListener('scroll', handleScrollEvent);
        }
    }
    
    ticking = false;
}

// 防抖处理，优化性能
function onScroll() {
    if (!ticking) {
        requestAnimationFrame(handleScrollEvent);
        ticking = true;
    }
}

window.addEventListener('scroll', onScroll);

// 初始化动画
function initAnimations() {
    // 为所有需要动画的元素添加初始类
    const animatedElements = document.querySelectorAll('section > .container > div, .service-item, .team-member, .contact-item');
    
    animatedElements.forEach((element, index) => {
        element.classList.add('animate-on-scroll');
        
        // 根据元素位置添加不同方向的动画类
        const elementType = element.classList.contains('service-item') || element.classList.contains('team-member') || element.classList.contains('contact-item') ? 'scale' : 
                          index % 2 === 0 ? 'left' : 'right';
        element.classList.add(elementType);
        
        // 添加页面加载动画类
        element.classList.add('page-load-animation');
        element.style.animationDelay = `${index * 0.05}s`;
    });
    
    // 为视差元素添加视差类
    const heroContent = document.querySelector('.hero-content');
    if (heroContent) {
        heroContent.classList.add('parallax');
        heroContent.setAttribute('data-speed', '0.15');
    }
    
    // 立即执行一次，确保可见元素有动画
    handleScrollEvent();
    handleScroll(); // 处理滚动进度指示器和回到顶部按钮
}

// 页面加载完成后初始化
window.addEventListener('load', initAnimations);

// 表单提交处理
const contactForm = document.querySelector('.contact-form form');

if (contactForm) {
    // 表单字段和错误信息
    const formFields = {
        name: {
            element: contactForm.querySelector('input[name="name"]'),
            errorMessage: '请输入您的姓名'
        },
        email: {
            element: contactForm.querySelector('input[name="email"]'),
            errorMessage: '请输入有效的电子邮箱地址'
        },
        message: {
            element: contactForm.querySelector('textarea[name="message"]'),
            errorMessage: '请输入您的留言'
        }
    };
    
    // 表单验证函数
    function validateField(fieldName) {
        const field = formFields[fieldName];
        const value = field.element.value.trim();
        const formGroup = field.element.closest('.form-group');
        
        // 移除之前的错误信息
        formGroup.classList.remove('success', 'error');
        const existingError = formGroup.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
        
        // 验证逻辑
        if (!value) {
            // 添加错误样式和信息
            formGroup.classList.add('error');
            const errorMessage = document.createElement('div');
            errorMessage.className = 'error-message';
            errorMessage.textContent = field.errorMessage;
            formGroup.appendChild(errorMessage);
            return false;
        }
        
        // 邮箱格式验证
        if (fieldName === 'email') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                formGroup.classList.add('error');
                const errorMessage = document.createElement('div');
                errorMessage.className = 'error-message';
                errorMessage.textContent = '请输入有效的电子邮箱地址';
                formGroup.appendChild(errorMessage);
                return false;
            }
        }
        
        // 添加成功样式
        formGroup.classList.add('success');
        return true;
    }
    
    // 验证所有字段
    function validateForm() {
        let isValid = true;
        for (const fieldName in formFields) {
            if (!validateField(fieldName)) {
                isValid = false;
            }
        }
        return isValid;
    }
    
    // 为每个字段添加实时验证
    Object.keys(formFields).forEach(fieldName => {
        const field = formFields[fieldName];
        
        // 失去焦点时验证
        field.element.addEventListener('blur', () => {
            validateField(fieldName);
        });
        
        // 输入时移除错误状态
        field.element.addEventListener('input', () => {
            const formGroup = field.element.closest('.form-group');
            formGroup.classList.remove('error');
            const existingError = formGroup.querySelector('.error-message');
            if (existingError) {
                existingError.remove();
            }
        });
    });
    
    // 表单提交事件
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // 验证表单
        if (!validateForm()) {
            return;
        }
        
        const submitButton = contactForm.querySelector('.btn');
        const originalText = submitButton.textContent;
        
        // 添加加载状态
        submitButton.textContent = '';
        submitButton.classList.add('loading');
        
        try {
            // 模拟API请求延迟
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // 提交成功
            alert('消息发送成功！我们会尽快与您联系。');
            contactForm.reset();
            
            // 移除所有成功状态
            contactForm.querySelectorAll('.form-group').forEach(group => {
                group.classList.remove('success');
            });
        } catch (error) {
            // 提交失败
            alert('消息发送失败，请稍后重试！');
        } finally {
            // 恢复按钮状态
            submitButton.classList.remove('loading');
            submitButton.textContent = originalText;
        }
    });
}

// 服务项目卡片悬停效果增强
const serviceItems = document.querySelectorAll('.service-item');

serviceItems.forEach(item => {
    item.addEventListener('mouseenter', () => {
        item.style.transform = 'translateY(-15px) scale(1.02)';
    });
    
    item.addEventListener('mouseleave', () => {
        item.style.transform = 'translateY(0) scale(1)';
    });
});

// 团队成员卡片悬停效果增强
const teamMembers = document.querySelectorAll('.team-member');

teamMembers.forEach(member => {
    member.addEventListener('mouseenter', () => {
        member.style.transform = 'translateY(-15px)';
    });
    
    member.addEventListener('mouseleave', () => {
        member.style.transform = 'translateY(0)';
    });
});

// 联系项悬停效果增强
const contactItems = document.querySelectorAll('.contact-item');

contactItems.forEach(item => {
    item.addEventListener('mouseenter', () => {
        item.style.transform = 'translateX(15px) scale(1.02)';
    });
    
    item.addEventListener('mouseleave', () => {
        item.style.transform = 'translateX(0) scale(1)';
    });
});

// 创建并添加滚动进度指示器
const progressIndicator = document.createElement('div');
progressIndicator.className = 'progress-indicator';
document.body.appendChild(progressIndicator);

// 创建回到顶部按钮功能
const backToTopButton = document.getElementById('backToTop');

// 滚动事件处理函数 - 处理滚动进度指示器和回到顶部按钮
function handleScroll() {
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    const scrollPercentage = (scrollTop / scrollHeight) * 100;
    
    // 更新滚动进度指示器
    progressIndicator.style.width = scrollPercentage + '%';
    
    // 控制回到顶部按钮的显示/隐藏
    if (scrollTop > 300) {
        backToTopButton.classList.add('visible');
        backToTopButton.classList.remove('hidden');
    } else {
        backToTopButton.classList.add('hidden');
        backToTopButton.classList.remove('visible');
    }
}

// 回到顶部功能
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// 页面加载动画
function initPageLoadAnimation() {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
}

// 合并所有页面加载初始化逻辑
function initPage() {
    // 添加滚动事件监听器
    window.addEventListener('scroll', handleScroll);
    
    // 添加回到顶部按钮点击事件
    backToTopButton.addEventListener('click', scrollToTop);
    
    // 初始化滚动进度指示器和回到顶部按钮
    handleScroll();
    
    // 执行页面加载动画
    initPageLoadAnimation();
    
    // 启动服务器运行时间计时
    startServerRunTime();
}

// 页面加载完成后初始化
window.addEventListener('load', initPage);