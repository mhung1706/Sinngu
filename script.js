"use strict";

const startBtn = document.getElementById("startBtn");
const replayBtn = document.getElementById("replayBtn");
const soundBtn = document.getElementById("soundBtn");
const countdown = document.getElementById("countdown");
const result = document.getElementById("result");
const lyna = document.getElementById("lyna");
const sinh = document.getElementById("sinh");
const lynaBubble = document.getElementById("lynaBubble");
const sinhBubble = document.getElementById("sinhBubble");
const lynaScoreEl = document.getElementById("lynaScore");
const particles = document.getElementById("particles");

let lynaScore = 0;
let isPlaying = false;
let soundOn = true;
let audioContext = null;
const choices = {
  rock: { icon: "✊", label: "BÚA", beats: "scissors" },
  paper: { icon: "🖐️", label: "BAO", beats: "rock" },
  scissors: { icon: "✌️", label: "KÉO", beats: "paper" }
};
const choiceNames = Object.keys(choices);

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function setAction(character, action) {
  character.dataset.action = action;
}

function resetRoundVisuals() {
  lyna.classList.remove("loser");
  sinh.classList.remove("loser");
  lyna.classList.remove("reveal");
  sinh.classList.remove("reveal");
  lynaBubble.classList.remove("show");
  sinhBubble.classList.remove("show");
  result.classList.remove("win");
  particles.replaceChildren();
  setAction(lyna, "idle");
  setAction(sinh, "idle");
}

function revealChoice(character, choiceName) {
  const sign = character.querySelector(".hand-sign");
  const choice = choices[choiceName];
  sign.innerHTML = `${choice.icon}<small>${choice.label}</small>`;
  character.classList.add("reveal");
}

function tone(frequency, duration = 0.12, type = "sine") {
  if (!soundOn) return;
  try {
    audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = type;
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0.1, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
    oscillator.connect(gain).connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + duration);
  } catch (error) {
    console.info("Trình duyệt không hỗ trợ Web Audio.", error);
  }
}

function speakVictory() {
  if (!soundOn || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const speech = new SpeechSynthesisUtterance("SinH ngu");
  speech.lang = "vi-VN";
  speech.pitch = 1.35;
  speech.rate = 1;
  window.speechSynthesis.speak(speech);
}

function speakChant(text) {
  if (!soundOn || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const spokenText = {
    ONE: "One",
    TWO: "Two",
    THREE: "Three",
    "RA CÁI GÌ?": "Ra cái gì?",
    "RA CÁI NÀY!": "Ra cái này!"
  }[text] || text;
  const speech = new SpeechSynthesisUtterance(spokenText);
  speech.lang = text.startsWith("RA") ? "vi-VN" : "en-US";
  speech.pitch = 1.25;
  speech.rate = 1.05;
  window.speechSynthesis.speak(speech);
}

function makeCelebration() {
  const colors = ["#ff5f9e", "#ffdd57", "#68c8ff", "#9be58e", "#b78cff"];
  for (let i = 0; i < 46; i += 1) {
    const piece = document.createElement("i");
    const isStar = i % 5 === 0;
    piece.className = `particle${isStar ? " star" : ""}`;
    piece.style.setProperty("--c", colors[i % colors.length]);
    piece.style.setProperty("--x", `${Math.round(Math.random() * 760 - 380)}px`);
    piece.style.setProperty("--y", `${Math.round(Math.random() * 65 + 5)}%`);
    piece.style.setProperty("--r", `${Math.random() * 180}deg`);
    piece.style.animationDelay = `${Math.random() * 0.18}s`;
    if (isStar) piece.textContent = "★";
    particles.appendChild(piece);
  }
}

async function showCount(word, note) {
  countdown.textContent = word;
  countdown.classList.remove("show");
  void countdown.offsetWidth;
  countdown.classList.add("show");
  tone(note, 0.18, "triangle");
  speakChant(word);
  await wait(720);
}

async function playRound() {
  if (isPlaying) return;
  isPlaying = true;
  startBtn.disabled = true;
  replayBtn.disabled = true;
  resetRoundVisuals();
  result.textContent = "Chuẩn bị nào...";

  await showCount("ONE", 440);
  await showCount("TWO", 554);
  await showCount("THREE", 659);
  await showCount("RA CÁI GÌ?", 740);
  await showCount("RA CÁI NÀY!", 880);
  countdown.classList.remove("show");

  // SinH ra ngẫu nhiên; Lyna được ghép nước khắc chế để luôn thắng.
  const sinhChoice = choiceNames[Math.floor(Math.random() * choiceNames.length)];
  const lynaChoice = choiceNames.find(name => choices[name].beats === sinhChoice);
  revealChoice(lyna, lynaChoice);
  revealChoice(sinh, sinhChoice);
  await wait(430);

  lynaScore += 1;
  lynaScoreEl.textContent = String(lynaScore);
  document.querySelector(".lyna-score").classList.remove("bump");
  void lynaScoreEl.offsetWidth;
  document.querySelector(".lyna-score").classList.add("bump");
  result.textContent = "LYNA THẮNG!";
  result.classList.add("win");
  setAction(lyna, "jump");
  setAction(sinh, "idle");
  sinh.classList.add("loser");
  lynaBubble.classList.add("show");
  sinhBubble.classList.add("show");
  makeCelebration();
  tone(784, 0.15, "square");
  setTimeout(() => tone(988, 0.2, "square"), 160);
  speakVictory();

  await wait(2000);
  isPlaying = false;
  startBtn.disabled = false;
  replayBtn.disabled = false;
  startBtn.textContent = "▶ Lượt mới";
}

function restartGame() {
  if (isPlaying) return;
  lynaScore = 0;
  lynaScoreEl.textContent = "0";
  resetRoundVisuals();
  result.textContent = "Sẵn sàng chưa?";
  startBtn.textContent = "▶ Bắt đầu";
  replayBtn.disabled = true;
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
}

function toggleSound() {
  soundOn = !soundOn;
  soundBtn.textContent = soundOn ? "🔊" : "🔇";
  soundBtn.setAttribute("aria-label", soundOn ? "Tắt âm thanh" : "Bật âm thanh");
  soundBtn.setAttribute("aria-pressed", String(soundOn));
  if (!soundOn && "speechSynthesis" in window) window.speechSynthesis.cancel();
  if (soundOn) tone(660, 0.1);
}

startBtn.addEventListener("click", playRound);
replayBtn.addEventListener("click", restartGame);
soundBtn.addEventListener("click", toggleSound);
