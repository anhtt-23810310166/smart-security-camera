const video = document.getElementById('webcam');
const canvas = document.getElementById('captureCanvas');
const ctx = canvas.getContext('2d');

const toggleBtn = document.getElementById('toggleEngineBtn');
const scanLine = document.querySelector('.scan-line');

const statusIndicator = document.getElementById('statusIndicator');
const statusText = document.getElementById('statusText');
const statusIcon = document.getElementById('statusIcon');
const logList = document.getElementById('logList');

let isEngineRunning = false;
let inferenceInterval = null;

// Cập nhật đồng hồ
setInterval(() => {
    const now = new Date();
    document.getElementById('systemTime').innerText = now.toLocaleTimeString('en-US', { hour12: false });
}, 1000);

function addLog(msg, type = 'info') {
    const li = document.createElement('li');
    const time = new Date().toLocaleTimeString('en-US', { hour12: false });
    
    let color = 'inherit';
    if(type === 'alarm') color = 'var(--alarm)';
    if(type === 'safe') color = 'var(--safe)';
    
    li.innerHTML = `<span class="log-time">[${time}]</span> <span style="color:${color}; font-weight:500;">${msg}</span>`;
    logList.prepend(li);
    
    if(logList.children.length > 20) {
        logList.removeChild(logList.lastChild);
    }
}

async function startWebcam() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
        video.srcObject = stream;
        addLog('Đã kết nối Camera', 'safe');
    } catch (err) {
        addLog(`Lỗi Camera: ${err.message}`, 'alarm');
        statusText.innerText = 'LỖI CAMERA';
    }
}

async function analyzeFrame() {
    if (!isEngineRunning) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(async (blob) => {
        const formData = new FormData();
        formData.append('file', blob, 'frame.jpg');

        try {
            const response = await fetch('http://localhost:8080/predict', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) throw new Error("Mất kết nối Server");

            const result = await response.json();
            updateStatus(result);

        } catch (error) {
            console.error(error);
        }
    }, 'image/jpeg', 0.8);
}

function updateStatus(result) {
    statusIndicator.className = 'status-indicator';
    
    if (result.status === "SAFE") {
        statusIndicator.classList.add('safe');
        statusIcon.innerText = '🐾'; 
        statusText.innerText = result.message;
        addLog(`Phân tích: ${result.message}`, 'safe');
    } 
    else if (result.status === "ALARM") {
        statusIndicator.classList.add('alarm');
        statusIcon.innerText = '⚠️';
        statusText.innerText = result.message;
        addLog(`Cảnh báo: ${result.message}`, 'alarm');
    }
    else {
        statusIcon.innerText = '👁️';
        statusText.innerText = 'Đang giám sát...';
    }
}

toggleBtn.addEventListener('click', () => {
    isEngineRunning = !isEngineRunning;
    
    if (isEngineRunning) {
        toggleBtn.innerText = 'TẮT AI ENGINE';
        toggleBtn.classList.add('active');
        scanLine.style.display = 'block';
        
        statusIndicator.className = 'status-indicator';
        statusIcon.innerText = '👁️';
        statusText.innerText = 'Đang quét ảnh...';
        
        addLog('Bật hệ thống AI nhận diện.', 'info');
        inferenceInterval = setInterval(analyzeFrame, 1500);
    } else {
        toggleBtn.innerText = 'BẬT AI ENGINE';
        toggleBtn.classList.remove('active');
        scanLine.style.display = 'none';
        clearInterval(inferenceInterval);
        
        statusIndicator.className = 'status-indicator';
        statusIcon.innerText = '🛡️';
        statusText.innerText = 'Hệ thống đã dừng';
        
        addLog('Tắt hệ thống AI.', 'info');
    }
});

startWebcam();
