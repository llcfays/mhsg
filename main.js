"ui";

// 请求必要的权限
auto.waitFor();

// 设置运行模式为无障碍模式
setScreenMetrics(1080, 2340); // 设置屏幕分辨率，根据实际设备调整？

// 导入BOSS配置
const bossConfig =  [
    // BOSS1配置
    {
        id: "BOSS1",
        name: "魔王",
        baseColor: "#72f1fd",
        colors: [
            [60, -40, "#1c1c1c"],
            [40, -86, "#079dbe"],
            [-11, -68, "#1b1e1e"]
        ],
        clickPoint: {x: 540, y: 1000}
    },
    // BOSS2配置
    {
        id: "BOSS2",
        name: "恶龙",
        baseColor: "#72f1fd",
        colors: [
            [60, -40, "#1c1c1c"],
            [40, -86, "#079dbe"],
            [-11, -68, "#1b1e1e"]
        ],
        clickPoint: {x: 540, y: 1000}
    },
    // BOSS3配置
    {
        id: "BOSS3",
        name: "巨兽",
        baseColor: "#72f1fd",
        colors: [
            [60, -40, "#1c1c1c"],
            [40, -86, "#079dbe"],
            [-11, -68, "#1b1e1e"]
        ],
        clickPoint: {x: 540, y: 1000}
    }
];

// BOSS切换相关变量
let currentBossIndex = 0;
let detectStartTime = new Date().getTime(); // 初始化检测开始时间

// BOSS战斗相关配置
const config = {
    checkInterval: 1000,      // BOSS检测间隔（毫秒）
    maxBattleTime: 300000,    // 最大战斗时间（毫秒）
    maxDetectTime: 60000,     // BOSS检测最大时间（毫秒）
    switchLineDelay: 2000,    // 切换线路后等待时间（毫秒）
    currentLine: 1,           // 当前线路号
    selectedLines: [],        // 选中的线路
    bossType: "BOSS1"         // 当前选择的BOSS类型
};

// 创建UI界面
ui.layout(
    <vertical padding="16" bg="#FFFFFF">
        <horizontal padding="16 8" bg="#F5F5F5" margin="0 0 8 0">
            <text id="currentBossText" textSize="16sp" textColor="#2196F3" layout_weight="1"/>
            <button id="switchBossBtn" text="切换BOSS" style="width: auto; height: 40dp; background: #2196F3; color: #FFFFFF; border-radius: 4dp"/>
        </horizontal>
        <vertical padding="16" bg="#F5F5F5" margin="0 0 8 0">
            <horizontal>
                <text text="BOSS检测间隔(秒)：" textSize="16sp" textColor="#2196F3"/>
                <input id="checkIntervalInput" text="1" inputType="numberDecimal" hint="1-3600"  layout_weight="1"  />
            </horizontal>
            <horizontal margin="0 8 0 0">
                <text text="最大战斗时间(秒)：" textSize="16sp" textColor="#2196F3"/>
                <input id="maxBattleTimeInput" text="300" inputType="numberDecimal" hint="60-7200"  layout_weight="1"/>
            </horizontal>
            <horizontal>
                <text text="BOSS检测超时时间(秒)：" textSize="16sp" textColor="#2196F3"/>
                <input id="maxDetectTimeInput" text="60" inputType="numberDecimal" hint="10-3600"  layout_weight="1" />
            </horizontal>
        </vertical>
        <vertical padding="16" bg="#F5F5F5" margin="0 0 8 0">
            <text text="选择切换线路：" textSize="16sp" textColor="#2196F3" margin="0 0 8 8"/>
            <horizontal>
                <checkbox id="line1" text="1线" checked="true" textColor="#1976D2"/>
                <checkbox id="line2" text="2线" checked="true" textColor="#1976D2"/>
                <checkbox id="line3" text="3线" checked="true" textColor="#1976D2"/>
                <checkbox id="line4" text="4线" checked="true" textColor="#1976D2"/>
                <checkbox id="line5" text="5线" checked="true" textColor="#1976D2"/>
            </horizontal>
            <horizontal>
                <checkbox id="line6" text="6线" checked="true" textColor="#1976D2"/>
                <checkbox id="line7" text="7线" checked="true" textColor="#1976D2"/>
                <checkbox id="line8" text="8线" checked="true" textColor="#1976D2"/>
                <checkbox id="line9" text="9线" checked="true" textColor="#1976D2"/>
                <checkbox id="line10" text="10线" checked="true" textColor="#1976D2"/>
            </horizontal>
        </vertical>
        <button id="startFloaty" text="启动悬浮窗" margin="0 0 8 0"/>
        <vertical padding="16" bg="#F5F5F5">
            <text text="运行日志：" textSize="16sp" textColor="#2196F3" margin="0 0 8 0"/>
            <input id="logArea" textSize="14sp" hint="日志输出区域" style="width: *; height: 200dp; background: #FFFFFF; padding: 8dp; border-radius: 4dp" focusable="false"/>
        </vertical>
    </vertical>
);

// 设置初始BOSS文本
ui.currentBossText.setText("当前BOSS：" + bossConfig[currentBossIndex].name);

// 切换BOSS按钮点击事件
ui.switchBossBtn.click(() => {
    currentBossIndex = (currentBossIndex + 1) % bossConfig.length;
    ui.currentBossText.setText("当前BOSS：" + bossConfig[currentBossIndex].name);
});



// 检查并请求截图权限
function requestCapturePermission() {
    return new Promise((resolve, reject) => {
        // 在子线程中执行权限请求
        threads.start(function() {
            try {
                let logMsg = "正在请求截图权限...";
                appendLog(logMsg);
                
                // 请求截图权限
                if (!images.requestScreenCapture(false)) {
                    logMsg = "获取截图权限失败，请授予截图权限后重试";
                    appendLog(logMsg);
                    resolve(false);
                    return;
                }
                
                // 等待权限授予完成
                setTimeout(() => {
                    logMsg = "已获取截图权限";
                    appendLog(logMsg);
                    resolve(true);
                }, 1000);
                
            } catch (e) {
                let logMsg = "请求截图权限时出错：" + e;
                appendLog(logMsg);
                resolve(false);
            }
        });
    });
}

// 检测BOSS是否出现
function checkBoss() {
    const currentBossConfig = bossConfig.find(boss => boss.id === config.bossType);
    if (!currentBossConfig) {
        let logMsg = "未找到BOSS配置信息：" + config.bossType;
        appendLog(logMsg);
        return false;
    }

    const now = new Date();
    let logMsg = `[${now.toLocaleTimeString()}] 开始检测BOSS：${currentBossConfig.name}，当前线路：${config.currentLine}`;
    appendLog(logMsg);

    let img = captureScreen();
    let p = images.findMultiColors(img, currentBossConfig.baseColor, currentBossConfig.colors);

    let found = p !== null;
    logMsg = `[${now.toLocaleTimeString()}] 检测结果：${found ? "发现BOSS" : "未发现BOSS"}`;
    appendLog(logMsg);
    return found;
}

// 切换线路
function switchLine() {
    const now = new Date();
    let logMsg = `[${now.toLocaleTimeString()}] 准备切换线路，当前线路：${config.currentLine}`;
    appendLog(logMsg);

    // 点击设置按钮（坐标需要根据实际游戏界面调整）
    click(800, 50);
    sleep(1000);
    
    // 获取下一个可用线路
    let currentIndex = config.selectedLines.indexOf(config.currentLine);
    let nextIndex = (currentIndex + 1) % config.selectedLines.length;
    let nextLine = config.selectedLines[nextIndex];
    
    logMsg = `[${now.toLocaleTimeString()}] 正在从线路${config.currentLine}切换到线路${nextLine}`;
    appendLog(logMsg);

    // 点击对应的线路按钮（坐标需要根据实际游戏界面调整）
    click(500 + (nextLine - 1) * 60, 300);
    config.currentLine = nextLine;
    sleep(config.switchLineDelay);

    const endTime = new Date();
    logMsg = `[${endTime.toLocaleTimeString()}] 线路切换完成，等待${config.switchLineDelay / 1000}秒后继续检测`;
    appendLog(logMsg);

    // 重置检测开始时间
    detectStartTime = new Date().getTime();
    logMsg = `[${endTime.toLocaleTimeString()}] 重置检测计时器`;
    appendLog(logMsg);
}

// 定义全局变量
let floatyWindow;

// 创建悬浮窗
function createFloatyWindow() {
    let isMaximized = true;
    
    // 创建单个悬浮窗
    floatyWindow = floaty.window(
        <frame id="mainFrame" w="200" h="200" bg="#ffffff">
            <vertical id="maximizedLayout" padding="8">
                <horizontal>
                    <button id="startBtn" text="开始"  weight="1" h="40" />
                    <button id="stopBtn" text="停止" visibility="gone"  weight="1" h="40" />
                    <button id="minimizeBtn" text="小" w="60" h="40" />
                </horizontal>
                <input id="floatyLog" w="*" h="*" textSize="12sp" textColor="#000000" bg="#f5f5f5" padding="4" gravity="top" focusable="false" />
            </vertical>
            <button id="maximizeBtn" text="大" textSize="16sp" w="40" h="40" visibility="gone" />
        </frame>
    );

    // 设置悬浮窗位置
    floatyWindow.setPosition(100, 100);
    
    // 最小化按钮点击事件
    floatyWindow.minimizeBtn.click(() => {
        floatyWindow.maximizedLayout.setVisibility(8); // GONE
        floatyWindow.maximizeBtn.setVisibility(0); // VISIBLE
        floatyWindow.mainFrame.attr('w', 40);
        floatyWindow.mainFrame.attr('h', 40);
        isMaximized = false;
    });

    // 最大化按钮点击事件
    floatyWindow.maximizeBtn.click(() => {
        floatyWindow.maximizedLayout.setVisibility(0); // VISIBLE
        floatyWindow.maximizeBtn.setVisibility(8); // GONE
        floatyWindow.mainFrame.attr('w', 200);
        floatyWindow.mainFrame.attr('h', 200);
        isMaximized = true;
    });

    // 启用悬浮窗调整
    // floatyWindow.setAdjustEnabled(true);

    // 开始和停止按钮点击事件
    let isRunning = false;
    let battleStartTime = 0;

    floatyWindow.startBtn.click(() => {
        // 防止重复点击
        if (isRunning) {
            toast("程序已在运行中");
            return;
        }

        // 检查截图权限
        if (!requestCapturePermission()) {
            return;
        }

        // 重置检测开始时间
        detectStartTime = new Date().getTime();
        appendLog("重置检测计时器");

        // 获取选中的线路
        config.selectedLines = [];
    for(let i = 1; i <= 10; i++) {
        if(ui["line" + i].checked) {
            config.selectedLines.push(i);
        }
    }
    
    if(config.selectedLines.length === 0) {
        let logMsg = "请至少选择一条线路";
        appendLog(logMsg);
        toast(logMsg);
        return;
    }
    
    // 获取当前选中的BOSS类型和检测超时时间
    let selectedBoss = bossConfig[currentBossIndex];
    config.bossType = selectedBoss.id;
    config.currentLine = config.selectedLines[0];
    
    // 更新检测超时时间配置
    let maxDetectTime = parseInt(ui.maxDetectTimeInput.text());
    if (isNaN(maxDetectTime) || maxDetectTime < 1) {
        let logMsg = "检测超时时间设置无效，使用默认值60秒";
        appendLog(logMsg);
        maxDetectTime = 60;
    }
    config.maxDetectTime = maxDetectTime * 1000; // 转换为毫秒
    
    isRunning = true;
    floatyWindow.startBtn.setVisibility(8); // GONE
    floatyWindow.stopBtn.setVisibility(0);  // VISIBLE
    appendLog( "开始自动战斗 - " + selectedBoss.name);

    // 启动BOSS检测线程
    threads.start(function() {
        while(isRunning) {
            ui.run(() => {
                let logMsg = "正在检测线路" + config.currentLine + "的BOSS...";
                appendLog(logMsg);
            });
            
            // 同步用户输入的配置值
            let checkInterval = parseInt(ui.checkIntervalInput.text());
            if (!isNaN(checkInterval) && checkInterval > 0) {
                config.checkInterval = checkInterval * 1000;
            }
            
            let maxBattleTime = parseInt(ui.maxBattleTimeInput.text());
            if (!isNaN(maxBattleTime) && maxBattleTime > 0) {
                config.maxBattleTime = maxBattleTime * 1000;
            }
            
            let maxDetectTime = parseInt(ui.maxDetectTimeInput.text());
            if (!isNaN(maxDetectTime) && maxDetectTime > 0) {
                config.maxDetectTime = maxDetectTime * 1000;
            }
            if (checkBoss()) {
                let logMsg = "发现BOSS！开始战斗";
                appendLog(logMsg);
                toast(logMsg);
                battleStartTime = new Date().getTime();
                
                // 点击BOSS（使用配置中的点击坐标）
                const currentBossConfig = bossConfig.find(boss => boss.id === config.bossType);
                const clickPoint = currentBossConfig.clickPoint;
                click(clickPoint.x, clickPoint.y);
                
                // 等待战斗结束或超时
                while(isRunning && checkBoss() && 
                      new Date().getTime() - battleStartTime < config.maxBattleTime) {
                    let battleTime = Math.floor((new Date().getTime() - battleStartTime) / 1000);
                    ui.run(() => {
                        let logMsg = "战斗进行中，已持续：" + battleTime + "秒";
                        appendLog(logMsg);
                    });
                    sleep(config.checkInterval);
                }
                
                if (isRunning) {
                    let logMsg;
                    if (new Date().getTime() - battleStartTime >= config.maxBattleTime) {
                        logMsg = "战斗超时，准备切换线路";
                    } else {
                        logMsg = "战斗结束，准备切换线路";
                    }
                    appendLog(logMsg);
                    switchLine();
                }
            } else {
                // 检查是否超过最大检测时间
                let currentTime = new Date().getTime();
                let detectTime = (currentTime - detectStartTime) / 1000;
                if (detectTime >= config.maxDetectTime / 1000) {
                    ui.run(() => {
                        let logMsg = `检测已用时${detectTime.toFixed(1)}秒，超过最大检测时间${config.maxDetectTime / 1000}秒，准备切换线路`;
                        appendLog(logMsg);
                    });
                    switchLine();
                } else {
                    ui.run(() => {
                        let logMsg = `未发现BOSS，已检测${detectTime.toFixed(1)}秒，最大检测时间${config.maxDetectTime / 1000}秒...`;
                        appendLog(logMsg);
                    });
                }
            }
            sleep(config.checkInterval);
        }
    });
});

    floatyWindow.stopBtn.click(() => {
        isRunning = false;
        floatyWindow.stopBtn.setVisibility(8);  // GONE
        floatyWindow.startBtn.setVisibility(0); // VISIBLE
        let logMsg = "停止自动战斗";
        appendLog(logMsg);
        toast(logMsg);
    });

    return floatyWindow;
}

// 启动悬浮窗按钮点击事件
ui.startFloaty.click(() => {
    createFloatyWindow();
});



// 添加日志到输出区域
function appendLog(logMsg) {
    ui.run(() => {
        // 更新主界面日志
        let logArea = ui.logArea;
        let currentText = logArea.text();
        logArea.setText(logMsg + "\n" + (currentText || ""));
        logArea.scrollTo(0, 0);

        // 仅当悬浮窗存在且已创建时更新悬浮窗日志
        if (typeof floatyWindow !== 'undefined' && floatyWindow && floatyWindow.floatyLog) {
            let floatyLogArea = floatyWindow.floatyLog;
            let floatyCurrentText = floatyLogArea.text();
            floatyLogArea.setText(logMsg + "\n" + (floatyCurrentText || ""));
        }
    });
}

// 添加输入框值变化监听
ui.checkIntervalInput.on("text_changed", (text) => {
    let value = parseInt(text);
    if (!isNaN(value) && value > 0) {
        config.checkInterval = value * 1000; // 转换为毫秒
        let logMsg = `BOSS检测间隔已更新为${value}秒`;
        appendLog(logMsg);
    }
});

ui.maxBattleTimeInput.on("text_changed", (text) => {
    let value = parseInt(text);
    if (!isNaN(value) && value > 0) {
        config.maxBattleTime = value * 1000; // 转换为毫秒
        let logMsg = `最大战斗时间已更新为${value}秒`;
        appendLog(logMsg);
    }
});

ui.maxDetectTimeInput.on("text_changed", (text) => {
    let value = parseInt(text);
    if (!isNaN(value) && value > 0) {
        config.maxDetectTime = value * 1000; // 转换为毫秒
        let logMsg = `BOSS检测超时时间已更新为${value}秒`;
        appendLog(logMsg);
    }
});