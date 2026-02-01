// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 添加平滑滚动到锚点的功能
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80, // 考虑固定头部的高度
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // 添加回到顶部按钮
    const topButton = document.createElement('button');
    topButton.innerHTML = '↑';
    topButton.id = 'top-button';
    topButton.title = '回到顶部';
    document.body.appendChild(topButton);
    
    // 回到顶部按钮样式
    topButton.style.position = 'fixed';
    topButton.style.bottom = '30px';
    topButton.style.right = '30px';
    topButton.style.zIndex = '1000';
    topButton.style.width = '50px';
    topButton.style.height = '50px';
    topButton.style.borderRadius = '50%';
    topButton.style.backgroundColor = '#3498db';
    topButton.style.color = 'white';
    topButton.style.border = 'none';
    topButton.style.fontSize = '20px';
    topButton.style.cursor = 'pointer';
    topButton.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
    topButton.style.display = 'none'; // 初始隐藏
    
    // 监听滚动事件，控制回到顶部按钮的显示/隐藏
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            topButton.style.display = 'block';
        } else {
            topButton.style.display = 'none';
        }
    });
    
    // 回到顶部按钮点击事件
    topButton.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    // 为表格添加排序功能
    const tables = document.querySelectorAll('table');
    tables.forEach(table => {
        const headers = table.querySelectorAll('th');
        headers.forEach((header, index) => {
            header.style.cursor = 'pointer';
            header.style.userSelect = 'none';
            
            header.addEventListener('click', function() {
                sortTable(table, index);
            });
        });
    });
    
    // 表格排序函数
    function sortTable(table, columnIndex) {
        const tbody = table.querySelector('tbody');
        const rows = Array.from(tbody.querySelectorAll('tr'));
        
        // 判断当前排序状态
        const isAscending = header.classList.contains('asc');
        
        // 排序
        rows.sort((a, b) => {
            const aValue = a.cells[columnIndex].textContent.trim();
            const bValue = b.cells[columnIndex].textContent.trim();
            
            // 尝试转换为数字进行比较
            const aNum = parseFloat(aValue.replace(/[^\d.-]/g, ''));
            const bNum = parseFloat(bValue.replace(/[^\d.-]/g, ''));
            
            if (!isNaN(aNum) && !isNaN(bNum)) {
                return isAscending ? bNum - aNum : aNum - bNum;
            } else {
                if (isAscending) {
                    return bValue.localeCompare(aValue);
                } else {
                    return aValue.localeCompare(bValue);
                }
            }
        });
        
        // 清除之前的排序标记
        const allHeaders = table.querySelectorAll('th');
        allHeaders.forEach(th => th.classList.remove('asc', 'desc'));
        
        // 添加当前列的排序标记
        header.classList.toggle(isAscending ? 'desc' : 'asc');
        
        // 重新插入行
        rows.forEach(row => tbody.appendChild(row));
    }
    
    // 添加搜索功能
    const searchContainer = document.createElement('div');
    searchContainer.className = 'search-container';
    searchContainer.innerHTML = `
        <input type="text" id="search-input" placeholder="搜索节点或属性...">
        <button id="search-button">搜索</button>
        <button id="clear-search">清除</button>
    `;
    
    // 插入搜索框到导航栏下方
    const nav = document.querySelector('nav');
    if (nav) {
        nav.parentNode.insertBefore(searchContainer, nav.nextSibling);
        
        // 搜索框样式
        const searchStyles = document.createElement('style');
        searchStyles.textContent = `
            .search-container {
                display: flex;
                justify-content: center;
                padding: 15px 0;
                background-color: #fff;
                border-bottom: 1px solid #eee;
            }
            
            #search-input {
                width: 300px;
                padding: 10px 15px;
                border: 1px solid #ddd;
                border-radius: 25px 0 0 25px;
                font-size: 1rem;
                outline: none;
            }
            
            #search-button, #clear-search {
                padding: 10px 15px;
                border: 1px solid #3498db;
                background-color: #3498db;
                color: white;
                cursor: pointer;
                font-size: 1rem;
                outline: none;
            }
            
            #search-button {
                border-radius: 0 25px 25px 0;
                border-left: none;
            }
            
            #clear-search {
                border-radius: 25px;
                margin-left: 10px;
                background-color: #e74c3c;
                border-color: #e74c3c;
            }
            
            #search-button:hover {
                background-color: #2980b9;
            }
            
            #clear-search:hover {
                background-color: #c0392b;
            }
        `;
        document.head.appendChild(searchStyles);
    }
    
    // 搜索功能实现
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const clearButton = document.getElementById('clear-search');
    
    if (searchInput && searchButton && clearButton) {
        // 搜索按钮事件
        searchButton.addEventListener('click', performSearch);
        
        // 搜索框回车事件
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
        
        // 清除按钮事件
        clearButton.addEventListener('click', function() {
            searchInput.value = '';
            clearHighlights();
        });
    }
    
    // 搜索函数
    function performSearch() {
        const searchTerm = searchInput.value.trim().toLowerCase();
        if (!searchTerm) return;
        
        // 清除之前的高亮
        clearHighlights();
        
        // 搜索所有文本节点
        const walker = document.createTreeWalker(
            document.body,
            NodeFilter.SHOW_TEXT,
            null,
            false
        );
        
        const textNodes = [];
        let node;
        
        while (node = walker.nextNode()) {
            if (node.parentElement.tagName !== 'SCRIPT' && 
                node.parentElement.tagName !== 'STYLE' &&
                node.parentElement.closest('.search-container') === null) {
                textNodes.push(node);
            }
        }
        
        // 查找匹配项并高亮
        textNodes.forEach(textNode => {
            const content = textNode.nodeValue.toLowerCase();
            if (content.includes(searchTerm)) {
                const parent = textNode.parentElement;
                const highlighted = highlightText(parent.innerHTML, searchTerm);
                parent.innerHTML = highlighted;
            }
        });
        
        // 滚动到第一个匹配项
        const firstMatch = document.querySelector('.search-highlight');
        if (firstMatch) {
            firstMatch.scrollIntoView({ behavior: 'smooth', block: 'center' });
            firstMatch.focus();
        }
    }
    
    // 高亮文本函数
    function highlightText(html, term) {
        const regex = new RegExp(`(${escapeRegExp(term)})`, 'gi');
        return html.replace(regex, '<span class="search-highlight" style="background-color: yellow; padding: 1px 2px; border-radius: 3px;">$1</span>');
    }
    
    // 转义正则表达式特殊字符
    function escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
    
    // 清除高亮
    function clearHighlights() {
        const highlights = document.querySelectorAll('.search-highlight');
        highlights.forEach(span => {
            const parent = span.parentElement;
            parent.innerHTML = parent.innerHTML.replace(/<span[^>]*>(.*?)<\/span>/g, '$1');
        });
    }
});

// 为表格标题添加排序指示器样式
document.addEventListener('DOMContentLoaded', function() {
    const style = document.createElement('style');
    style.textContent = `
        th.asc::after {
            content: ' ↑';
            color: #fff;
        }
        
        th.desc::after {
            content: ' ↓';
            color: #fff;
        }
    `;
    document.head.appendChild(style);
});