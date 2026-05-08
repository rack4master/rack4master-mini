// main.js
window.addEventListener('DOMContentLoaded', function() {
    setupUI();
    window.addEventListener('keydown', function(e) {
        var tag = e.target.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA') return;
        switch (e.code) {
            case 'Space': e.preventDefault(); document.getElementById('playPauseBtn').click(); break;
            case 'KeyS':  e.preventDefault(); document.getElementById('stopBtn').click();      break;
            case 'KeyL':  e.preventDefault(); document.getElementById('loopBtn').click();      break;
            case 'KeyB':  e.preventDefault(); document.getElementById('bypassBtn').click();    break;
        }
    });
});
