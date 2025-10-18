
const { useState, useMemo, useEffect } = React;

// Backgrounds
const BG = {
  start: "assets/bg-start.png",
  quiz: "assets/bg-quiz.png",
  result: "assets/bg-result.png"
};

// Questions: keep 'ban' (you) inside; we'll only prefix with the player's name.
const RAW_QUESTIONS = [
  "cảm thấy khó chịu khi bạn bè làm gì đó mà bạn không tham gia.",
  "thường xuyên kiểm tra mạng xã hội để không bỏ lỡ điều gì.",
  "thấy lo nếu không biết người khác đang làm gì.",
  "thường so sánh cuộc sống của mình với người khác trên mạng.",
  "cảm thấy buồn nếu thấy bạn bè đi chơi mà không rủ bạn.",
  "hay cập nhật story để mọi người biết bạn đang làm gì.",
  "sợ rằng mình đang bỏ lỡ những cơ hội quan trọng.",
  "thường cố tham gia nhiều sự kiện dù mệt.",
  "cảm thấy căng thẳng nếu không online trong vài giờ.",
  "muốn biết ngay khi có xu hướng mới trên mạng.",
  "cảm thấy bị tụt lại nếu không dùng app mới như bạn bè.",
  "kiểm tra thông báo nhiều lần mỗi ngày.",
  "cảm thấy vui hơn khi nhận được nhiều tương tác.",
  "thấy khó chịu nếu người khác không trả lời tin nhắn nhanh.",
  "cảm thấy mình không đủ thú vị nếu ít người quan tâm đến bài đăng.",
  "thường ưu tiên mạng xã hội hơn học tập hoặc nghỉ ngơi.",
  "cảm thấy thời gian online khiến bạn bỏ lỡ việc quan trọng hơn.",
  "sợ bị lãng quên nếu không xuất hiện thường xuyên trên mạng.",
  "cảm thấy khó chịu khi người khác biết điều gì đó mà bạn không biết.",
  "thấy không yên nếu không cập nhật tin tức mới."
];

const ENCOURAGEMENTS = [
  "Cố lên nhé, chỉ cần nhận ra điều này là {name} đã tiến bộ rồi!",
  "Thả lỏng xíu nè {name} — không cần biết hết mọi chuyện để vui đâu!",
  "Ổn áp rồi {name}, thử giảm online 10 phút mỗi ngày xem sao?",
  "{name} đang làm tốt lắm, quan tâm đến bản thân hơn chút nhé!",
  "Niceee {name}, tự tin vào lựa chọn của mình là điều tuyệt nhất!"
];

function useAudioAutoplay() {
  useEffect(() => {
    const audio = document.getElementById("bgm");
    if (!audio) return;

    // Try autoplay immediately
    const tryPlay = () => audio.play().catch(() => {});
    tryPlay();

    // Unmute / play on first interaction if browser blocked
    const kick = () => { audio.muted = false; audio.play().catch(()=>{}); window.removeEventListener("click", kick); window.removeEventListener("touchstart", kick); };
    window.addEventListener("click", kick, { once: true });
    window.addEventListener("touchstart", kick, { once: true });
  }, []);
}

function App() {
  const [stage, setStage] = useState("start"); // start | quiz | result
  const [player, setPlayer] = useState("");
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [lastScore, setLastScore] = useState(null);

  useAudioAutoplay();

  const questions = useMemo(() => RAW_QUESTIONS.map(q => `${player} ${q}`), [player]);
  const avg = answers.length ? answers.reduce((a,b)=>a+b,0)/answers.length : 0;

  const result = useMemo(() => {
    if (answers.length === 0) return null;
    if (avg < 2.6) return { level: "Không bị FOMO", msg: `${player}, bạn rất ổn định và tự tin, tiếp tục sống đúng nhịp riêng của mình nhé! 🌟`, rec: "Bạn đang làm tuyệt vời lắm! Giữ vững tinh thần đó, và truyền cảm hứng cho người khác cùng 'bye FOMO' như bạn nhé!" };
    if (avg < 3.6) return { level: "FOMO nhẹ", msg: `${player}, bạn hơi bị ảnh hưởng bởi FOMO — không sao cả, ai cũng có lúc như vậy 💬`, rec: "Hãy đọc qua “Cẩm nang Bye FOMO” và ghé thăm trang FOMO Guard để hiểu bản thân hơn và học cách giữ cân bằng nhé!" };
    return { level: "FOMO nặng", msg: `${player}, bạn đang khá căng thẳng vì sợ bỏ lỡ 🌀`, rec: "Đừng lo! Hãy thử nghỉ mạng xã hội một chút, đọc “Cẩm nang Bye FOMO”, và truy cập FOMO Guard để khám phá cách yêu bản thân hơn nhé!" };
  }, [answers, player, avg]);

  const bg = stage === "start" ? BG.start : stage === "quiz" ? BG.quiz : BG.result;

  const handleStart = () => {
    if (!player.trim()) return;
    setStage("quiz");
    setIdx(0);
    setAnswers([]);
    const audio = document.getElementById("bgm");
    if (audio) { audio.muted = false; audio.play().catch(()=>{}); }
  };

  const handleAnswer = (score) => {
    setAnswers(prev => [...prev, score]);
    setLastScore(score);
    setTimeout(() => {
      setLastScore(null);
      if (idx + 1 >= questions.length) { setStage("result"); return; }
      setIdx(idx + 1);
    }, 700);
  };

  return (
    <div className="app" style={{backgroundImage:`url(${bg})`}}>
      {stage === "start" && (
        <div className="card fade-enter-active">
          <h1>Chào mừng bạn đến với <em>vùng đất âm thanh</em></h1>
          <p>Ở đây, {player || "bạn"} sẽ được lắng nghe chính mình — không vội, không FOMO.</p>
          <h2>Nhập tên để bắt đầu</h2>
          <input className="input" placeholder="Tên của bạn..." value={player} onChange={e=>setPlayer(e.target.value)} />
          <button className="btn" onClick={handleStart}>Bắt đầu</button>
          <div className="audio-tip">🎵 Nhạc nền sẽ phát xuyên suốt. Nếu chưa nghe, chạm vào màn hình để bật.</div>
        </div>
      )}

      {stage === "quiz" && (
        <div className="card fade-enter-active">
          <h1>Bài test FOMO của {player}</h1>
          <p className="small">Câu {idx+1}/{questions.length}</p>
          <p style={{fontSize: '20px', fontWeight: 600, marginTop: '6px'}}>{questions[idx]}</p>
          <p className="small">(1 = rất khó chịu • 5 = không khó chịu)</p>

          <div className="pill-row">
            {[1,2,3,4,5].map(n => (
              <button key={n} className="pill" onClick={()=>handleAnswer(n)}>{n}</button>
            ))}
          </div>

          {lastScore != null && (
            <div className="encourage">
              {ENCOURAGEMENTS[Math.floor(Math.random()*ENCOURAGEMENTS.length)].replaceAll("{name}", player)}
            </div>
          )}

          <div className="progress" style={{marginTop:12}}>
            <div className="bar"><span style={{width: `${Math.round(((idx)/questions.length)*100)}%`}}></span></div>
            <span className="small">{idx}/{questions.length}</span>
          </div>
        </div>
      )}

      {stage === "result" && result && (
        <div className="card fade-enter-active">
          <h1>Kết quả của {player}</h1>
          <p style={{fontSize:'20px'}}><strong>Mức độ:</strong> {result.level}</p>
          <p>{result.msg}</p>
          <p className="small" style={{fontStyle:'italic'}}>{result.rec}</p>
          <div style={{marginTop:16, display:'flex', gap:8, justifyContent:'center'}}>
            <button className="btn secondary" onClick={()=>{ setStage("start"); setPlayer(""); }}>Đổi tên</button>
            <button className="btn" onClick={()=>{ setStage("quiz"); setIdx(0); setAnswers([]); }}>Làm lại</button>
          </div>
        </div>
      )}
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
