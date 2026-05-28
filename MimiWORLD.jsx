import { useState, useEffect } from "react";

const STORAGE_KEY = "mimiworld_data";
const APP_PASSWORD = "mimi2024";

const todayStr = () => new Date().toISOString().split("T")[0];
const fmt = (n) => "GHS " + Number(n || 0).toLocaleString("en-GH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const addWorkingDays = (dateStr, days) => {
  const d = new Date(dateStr);
  let added = 0;
  while (added < days) {
    d.setDate(d.getDate() + 1);
    if (d.getDay() !== 0 && d.getDay() !== 6) added++;
  }
  return d.toISOString().split("T")[0];
};

const workingDaysBetween = (start, end) => {
  const s = new Date(start), e = new Date(end);
  let count = 0;
  const cur = new Date(s);
  while (cur <= e) {
    if (cur.getDay() !== 0 && cur.getDay() !== 6) count++;
    cur.setDate(cur.getDate() + 1);
  }
  return count;
};

const defaultData = () => ({ clients: [], loans: [], payments: [], dailyAccounts: [], nextClientId: 1, nextLoanId: 1, nextPaymentId: 1 });

const styles = `
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;900&family=Cormorant+Garamond:ital,wght@0,300;0,600;1,300&family=DM+Sans:wght@300;400;500;600&display=swap');

:root {
  --purple-deep: #1A0638;
  --purple-mid:  #3D0E8F;
  --purple-soft: #6B35C9;
  --purple-pale: #EDE0FF;
  --gold:        #C9922A;
  --gold-light:  #F5C842;
  --gold-pale:   #FFF8E7;
  --white:       #FFFFFF;
  --off-white:   #FAF8FF;
  --text-dark:   #1A0638;
  --text-mid:    #5A4070;
  --text-light:  #9B85C0;
  --danger:      #C0392B;
  --success:     #1A7A4A;
  --warn:        #C96A00;
  --radius:      18px;
  --shadow:      0 4px 24px rgba(26,6,56,0.10);
  --shadow-gold: 0 4px 24px rgba(201,146,42,0.22);
}

* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: 'DM Sans', sans-serif; background: var(--off-white); color: var(--text-dark); min-height: 100vh; }

/* ── SPLASH ── */
.splash {
  position: fixed; inset: 0; z-index: 999;
  background: radial-gradient(ellipse at 50% 40%, #2D0A6E 0%, #0D0320 60%, #000 100%);
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  animation: splashFade 0.6s ease 3.2s forwards;
}
@keyframes splashFade { to { opacity: 0; pointer-events: none; } }

.splash-particles {
  position: absolute; inset: 0; overflow: hidden; pointer-events: none;
}
.particle {
  position: absolute; border-radius: 50%;
  background: radial-gradient(circle, rgba(245,200,66,0.6), transparent);
  animation: float linear infinite;
}
@keyframes float {
  0%   { transform: translateY(100vh) scale(0); opacity: 0; }
  10%  { opacity: 1; }
  90%  { opacity: 0.6; }
  100% { transform: translateY(-10vh) scale(1); opacity: 0; }
}

.splash-ring {
  width: 200px; height: 200px; border-radius: 50%;
  border: 1px solid rgba(245,200,66,0.15);
  position: absolute;
  animation: ringPulse 2s ease-in-out infinite;
}
.splash-ring:nth-child(1) { width: 160px; height: 160px; animation-delay: 0s; }
.splash-ring:nth-child(2) { width: 220px; height: 220px; animation-delay: 0.3s; }
.splash-ring:nth-child(3) { width: 280px; height: 280px; animation-delay: 0.6s; border-color: rgba(245,200,66,0.07); }
@keyframes ringPulse {
  0%, 100% { transform: scale(1); opacity: 0.4; }
  50% { transform: scale(1.05); opacity: 0.8; }
}

.splash-logo-wrap {
  position: relative; z-index: 2; text-align: center;
  animation: logoReveal 0.8s cubic-bezier(0.16,1,0.3,1) 0.4s both;
}
@keyframes logoReveal {
  from { transform: scale(0.7) translateY(20px); opacity: 0; }
  to   { transform: scale(1) translateY(0); opacity: 1; }
}

.splash-icon {
  font-size: 52px; margin-bottom: 12px;
  animation: iconGlow 2s ease-in-out infinite;
  filter: drop-shadow(0 0 16px rgba(245,200,66,0.8));
}
@keyframes iconGlow {
  0%, 100% { filter: drop-shadow(0 0 16px rgba(245,200,66,0.8)); }
  50%       { filter: drop-shadow(0 0 32px rgba(245,200,66,1)) drop-shadow(0 0 60px rgba(201,146,42,0.6)); }
}

.splash-title {
  font-family: 'Cinzel', serif; font-size: 48px; font-weight: 900;
  letter-spacing: 4px; line-height: 1;
  background: linear-gradient(135deg, #fff 0%, var(--gold-light) 40%, var(--gold) 70%, #fff 100%);
  background-size: 200% auto;
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  animation: shimmer 2.5s linear infinite, titleGlow 2s ease-in-out infinite;
  text-shadow: none;
}
@keyframes shimmer { to { background-position: 200% center; } }
@keyframes titleGlow {
  0%, 100% { filter: drop-shadow(0 0 8px rgba(245,200,66,0.4)); }
  50%       { filter: drop-shadow(0 0 20px rgba(245,200,66,0.9)); }
}

.splash-brand {
  font-family: 'Cormorant Garamond', serif; font-size: 16px; font-weight: 300;
  letter-spacing: 6px; text-transform: uppercase;
  color: rgba(255,255,255,0.75);
  margin-top: 8px;
  animation: brandReveal 0.6s ease 1s both;
}
@keyframes brandReveal { from { opacity: 0; letter-spacing: 12px; } to { opacity: 1; letter-spacing: 6px; } }

.splash-divider {
  width: 120px; height: 1px;
  background: linear-gradient(90deg, transparent, var(--gold-light), transparent);
  margin: 14px auto;
  animation: dividerGrow 0.6s ease 1.4s both;
}
@keyframes dividerGrow { from { width: 0; opacity: 0; } to { width: 120px; opacity: 1; } }

.splash-motto {
  font-family: 'Cormorant Garamond', serif; font-size: 13px; font-style: italic;
  color: rgba(245,200,66,0.7); letter-spacing: 1px;
  animation: mottoReveal 0.6s ease 1.8s both;
}
@keyframes mottoReveal { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

.splash-loader {
  margin-top: 48px; display: flex; flex-direction: column; align-items: center; gap: 10px;
  animation: loaderReveal 0.4s ease 2.2s both;
}
@keyframes loaderReveal { from { opacity: 0; } to { opacity: 1; } }
.splash-loader-bar {
  width: 160px; height: 2px; background: rgba(255,255,255,0.1); border-radius: 2px; overflow: hidden;
}
.splash-loader-fill {
  height: 100%; border-radius: 2px;
  background: linear-gradient(90deg, var(--gold), var(--gold-light));
  animation: loadFill 1s ease 2.2s both;
}
@keyframes loadFill { from { width: 0; } to { width: 100%; } }
.splash-loader-text {
  font-size: 10px; letter-spacing: 3px; text-transform: uppercase;
  color: rgba(255,255,255,0.35); font-family: 'DM Sans', sans-serif;
}

/* ── LOGIN ── */
.login-wrap {
  min-height: 100vh;
  background: linear-gradient(160deg, var(--purple-deep) 0%, var(--purple-mid) 55%, var(--purple-soft) 100%);
  display: flex; align-items: center; justify-content: center; padding: 24px;
}
.login-card {
  background: rgba(255,255,255,0.06); backdrop-filter: blur(24px);
  border: 1px solid rgba(201,146,42,0.25); border-radius: 28px;
  padding: 52px 36px; width: 100%; max-width: 380px; text-align: center;
  box-shadow: 0 16px 64px rgba(0,0,0,0.4);
}
.login-logo { font-family: 'Cinzel', serif; font-size: 34px; font-weight: 900; letter-spacing: 3px;
  background: linear-gradient(135deg, #fff 0%, var(--gold-light) 50%, var(--gold) 100%);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.login-brand { font-family: 'Cormorant Garamond', serif; font-size: 13px; letter-spacing: 4px;
  color: rgba(255,255,255,0.55); text-transform: uppercase; margin-top: 4px; }
.login-divider { width: 60px; height: 1px; background: linear-gradient(90deg, transparent, var(--gold-light), transparent); margin: 20px auto 32px; }
.login-input {
  width: 100%; padding: 15px 18px; background: rgba(255,255,255,0.08);
  border: 1px solid rgba(201,146,42,0.35); border-radius: 12px; color: #fff;
  font-size: 16px; font-family: 'DM Sans', sans-serif; outline: none; margin-bottom: 14px;
  transition: border 0.2s;
}
.login-input::placeholder { color: rgba(255,255,255,0.35); }
.login-input:focus { border-color: var(--gold-light); background: rgba(255,255,255,0.12); }
.login-btn {
  width: 100%; padding: 15px;
  background: linear-gradient(135deg, var(--gold), var(--gold-light));
  border: none; border-radius: 12px; font-family: 'Cinzel', serif;
  font-size: 15px; font-weight: 700; color: var(--purple-deep); cursor: pointer;
  box-shadow: var(--shadow-gold); transition: transform 0.15s, box-shadow 0.15s;
  letter-spacing: 2px;
}
.login-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(201,146,42,0.4); }
.login-err { color: #FF8A80; font-size: 13px; margin-top: 10px; }
.login-motto { font-family: 'Cormorant Garamond', serif; font-style: italic; font-size: 12px;
  color: rgba(245,200,66,0.5); margin-top: 28px; letter-spacing: 1px; }

/* ── APP SHELL ── */
.app-shell { display: flex; flex-direction: column; min-height: 100vh; }
.top-bar {
  background: var(--purple-deep); padding: 0 20px; height: 62px;
  display: flex; align-items: center; justify-content: space-between;
  position: sticky; top: 0; z-index: 100;
  border-bottom: 1px solid rgba(201,146,42,0.15);
  box-shadow: 0 2px 20px rgba(0,0,0,0.2);
}
.top-logo { font-family: 'Cinzel', serif; font-size: 20px; font-weight: 900; letter-spacing: 1px;
  background: linear-gradient(135deg, var(--gold-light), var(--gold));
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.top-sub { font-family: 'Cormorant Garamond', serif; font-size: 10px; letter-spacing: 3px;
  color: rgba(255,255,255,0.4); text-transform: uppercase; margin-top: 1px; }
.logout-btn { background: rgba(201,146,42,0.12); border: 1px solid rgba(201,146,42,0.3);
  color: rgba(245,200,66,0.8); padding: 7px 14px; border-radius: 8px;
  font-size: 12px; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: background 0.2s; }
.logout-btn:hover { background: rgba(201,146,42,0.22); }

/* ── NAV ── */
.bottom-nav {
  position: fixed; bottom: 0; left: 0; right: 0; background: var(--white);
  border-top: 1px solid var(--purple-pale); display: flex; z-index: 100;
  box-shadow: 0 -4px 20px rgba(26,6,56,0.08);
}
.nav-item {
  flex: 1; display: flex; flex-direction: column; align-items: center;
  padding: 9px 4px 7px; cursor: pointer; border: none; background: none;
  color: var(--text-light); font-size: 10px; font-family: 'DM Sans', sans-serif;
  transition: color 0.2s; position: relative;
}
.nav-item.active { color: var(--purple-mid); }
.nav-active-bar {
  position: absolute; top: 0; left: 20%; right: 20%; height: 2px;
  background: linear-gradient(90deg, var(--gold), var(--gold-light));
  border-radius: 0 0 3px 3px; opacity: 0; transition: opacity 0.2s;
}
.nav-item.active .nav-active-bar { opacity: 1; }
.nav-icon { font-size: 21px; margin-bottom: 2px; }

/* ── MAIN ── */
.main { flex: 1; padding: 20px 16px 96px; max-width: 480px; margin: 0 auto; width: 100%; }
.section-title { font-family: 'Cinzel', serif; font-size: 20px; font-weight: 700; color: var(--purple-deep); margin-bottom: 18px; }

/* ── CARDS ── */
.card { background: var(--white); border-radius: var(--radius); padding: 18px; margin-bottom: 14px;
  box-shadow: var(--shadow); border: 1px solid var(--purple-pale); }
.card-hero {
  background: linear-gradient(135deg, var(--purple-deep) 0%, var(--purple-mid) 100%);
  border: none; position: relative; overflow: hidden;
}
.card-hero::before {
  content: ''; position: absolute; top: -40px; right: -40px;
  width: 140px; height: 140px; border-radius: 50%;
  background: rgba(245,200,66,0.07);
}
.card-hero::after {
  content: ''; position: absolute; bottom: -30px; left: -20px;
  width: 100px; height: 100px; border-radius: 50%;
  background: rgba(255,255,255,0.04);
}
.hero-label { font-size: 10px; letter-spacing: 3px; text-transform: uppercase; color: rgba(255,255,255,0.5); margin-bottom: 6px; }
.hero-value { font-family: 'Cinzel', serif; font-size: 30px; font-weight: 700;
  background: linear-gradient(135deg, var(--gold-light), var(--gold));
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.hero-date { font-size: 11px; color: rgba(255,255,255,0.4); margin-top: 4px; }

.stat-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 14px; }
.stat-card { background: var(--white); border-radius: 14px; padding: 14px;
  border: 1px solid var(--purple-pale); box-shadow: var(--shadow); }
.stat-label { font-size: 10px; color: var(--text-light); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px; }
.stat-value { font-family: 'Cinzel', serif; font-size: 17px; color: var(--purple-deep); }
.stat-value.gold { color: var(--gold); }
.stat-value.danger { color: var(--danger); }
.stat-value.success { color: var(--success); }

/* ── ACCOUNT TABLE ── */
.account-row { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid var(--purple-pale); }
.account-row:last-child { border-bottom: none; }
.account-label { font-size: 14px; color: var(--text-mid); }
.account-amount { font-family: 'Cinzel', serif; font-size: 15px; font-weight: 700; }
.account-total .account-label { font-weight: 700; color: var(--purple-deep); font-size: 15px; }
.account-total .account-amount { font-size: 20px; color: var(--purple-deep); }
.account-avail { background: var(--purple-pale); border-radius: 10px; padding: 10px 14px; margin: 4px 0; display: flex; justify-content: space-between; align-items: center; }

/* ── FORMS ── */
.form-group { margin-bottom: 14px; }
.form-label { font-size: 11px; font-weight: 600; color: var(--text-mid); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px; display: block; }
.form-input, .form-select {
  width: 100%; padding: 13px 15px; border: 1.5px solid var(--purple-pale);
  border-radius: 12px; font-size: 15px; font-family: 'DM Sans', sans-serif;
  color: var(--text-dark); background: var(--white); outline: none;
  transition: border 0.2s, box-shadow 0.2s;
}
.form-input:focus, .form-select:focus { border-color: var(--purple-soft); box-shadow: 0 0 0 3px rgba(107,53,201,0.1); }
.form-hint { font-size: 11px; color: var(--text-light); margin-top: 4px; }

/* ── BUTTONS ── */
.btn { padding: 13px 22px; border-radius: 12px; border: none; font-family: 'DM Sans', sans-serif;
  font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.15s;
  display: inline-flex; align-items: center; gap: 7px; }
.btn-primary { background: linear-gradient(135deg, var(--purple-mid), var(--purple-soft)); color: white; box-shadow: 0 4px 16px rgba(61,14,143,0.25); }
.btn-primary:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(61,14,143,0.35); }
.btn-gold { background: linear-gradient(135deg, var(--gold), var(--gold-light)); color: var(--purple-deep); box-shadow: var(--shadow-gold); font-weight: 700; }
.btn-gold:hover { transform: translateY(-1px); }
.btn-outline { background: transparent; border: 1.5px solid var(--purple-pale); color: var(--purple-mid); }
.btn-outline:hover { border-color: var(--purple-soft); background: var(--purple-pale); }
.btn-danger { background: #FFEAEA; color: var(--danger); border: 1.5px solid #FFCDD2; }
.btn-success { background: #E8F5E9; color: var(--success); border: 1.5px solid #C8E6C9; }
.btn-sm { padding: 8px 14px; font-size: 12px; border-radius: 9px; }
.btn-full { width: 100%; justify-content: center; }
.row-flex { display: flex; gap: 10px; }
.row-flex > * { flex: 1; }

/* ── LOAN CARD ── */
.loan-card { background: var(--white); border-radius: var(--radius); border: 1px solid var(--purple-pale); margin-bottom: 12px; overflow: hidden; box-shadow: var(--shadow); }
.loan-header { padding: 14px 16px; display: flex; align-items: center; justify-content: space-between;
  background: linear-gradient(135deg, var(--purple-deep), var(--purple-mid)); border-bottom: none; }
.loan-name { font-weight: 600; color: white; font-size: 15px; }
.loan-badge { padding: 4px 10px; border-radius: 20px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
.badge-active { background: rgba(201,146,42,0.2); color: var(--gold-light); border: 1px solid rgba(201,146,42,0.3); }
.badge-arrears { background: rgba(192,57,43,0.2); color: #FF8A80; border: 1px solid rgba(192,57,43,0.3); }
.badge-cleared { background: rgba(26,122,74,0.2); color: #69F0AE; border: 1px solid rgba(26,122,74,0.3); }
.loan-body { padding: 14px 16px; }
.loan-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 7px; }
.loan-key { font-size: 12px; color: var(--text-light); }
.loan-val { font-size: 14px; font-weight: 600; color: var(--text-dark); }
.loan-val.gold { color: var(--gold); }
.loan-val.danger { color: var(--danger); }
.loan-val.success { color: var(--success); }
.progress-wrap { background: var(--purple-pale); border-radius: 8px; height: 5px; margin: 8px 0; overflow: hidden; }
.progress-bar { height: 100%; border-radius: 8px; background: linear-gradient(90deg, var(--gold), var(--gold-light)); transition: width 0.5s; }

/* ── CLIENT ── */
.client-card { background: var(--white); border-radius: var(--radius); border: 1px solid var(--purple-pale);
  padding: 14px; margin-bottom: 10px; display: flex; align-items: center; gap: 12px;
  box-shadow: var(--shadow); cursor: pointer; transition: box-shadow 0.2s, border-color 0.2s; }
.client-card:hover { border-color: var(--purple-soft); box-shadow: 0 6px 24px rgba(26,6,56,0.13); }
.client-avatar { width: 46px; height: 46px; border-radius: 14px; flex-shrink: 0;
  background: linear-gradient(135deg, var(--purple-mid), var(--purple-soft));
  display: flex; align-items: center; justify-content: center;
  font-family: 'Cinzel', serif; font-size: 18px; font-weight: 700; color: white; }
.client-name { font-weight: 600; font-size: 15px; color: var(--text-dark); }
.client-meta { font-size: 12px; color: var(--text-light); margin-top: 2px; }

/* ── MODAL ── */
.modal-overlay { position: fixed; inset: 0; background: rgba(26,6,56,0.55); z-index: 200;
  display: flex; align-items: flex-end; justify-content: center; backdrop-filter: blur(6px); }
.modal { background: var(--white); border-radius: 26px 26px 0 0; padding: 24px 18px 44px;
  width: 100%; max-width: 480px; max-height: 92vh; overflow-y: auto;
  animation: slideUp 0.28s cubic-bezier(0.16,1,0.3,1); }
@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
.modal-handle { width: 36px; height: 4px; background: var(--purple-pale); border-radius: 4px; margin: 0 auto 22px; }
.modal-title { font-family: 'Cinzel', serif; font-size: 19px; color: var(--purple-deep); margin-bottom: 18px; }

/* ── CALC PREVIEW ── */
.calc-preview { background: var(--gold-pale); border: 1px solid rgba(201,146,42,0.3); border-radius: 12px; padding: 14px; margin: 14px 0; }
.calc-row { display: flex; justify-content: space-between; margin-bottom: 5px; font-size: 14px; }
.calc-row.total { margin-top: 8px; padding-top: 8px; border-top: 1px solid rgba(201,146,42,0.3); font-weight: 700; color: var(--gold); font-size: 15px; }

/* ── MISC ── */
.tabs { display: flex; gap: 7px; margin-bottom: 18px; overflow-x: auto; padding-bottom: 3px; }
.tab { padding: 7px 16px; border-radius: 20px; border: 1.5px solid var(--purple-pale);
  background: var(--white); color: var(--text-mid); font-size: 12px; font-weight: 600;
  cursor: pointer; white-space: nowrap; transition: all 0.15s; font-family: 'DM Sans', sans-serif; }
.tab.active { background: var(--purple-mid); color: white; border-color: var(--purple-mid); }
.empty { text-align: center; padding: 48px 24px; color: var(--text-light); }
.empty-icon { font-size: 44px; margin-bottom: 10px; }
.empty-text { font-size: 14px; }
.divider { height: 1px; background: var(--purple-pale); margin: 10px 0; }
.alert { padding: 11px 14px; border-radius: 10px; font-size: 13px; margin-bottom: 10px; }
.alert-warn { background: #FFF3E0; color: var(--warn); border: 1px solid #FFE0B2; }
.alert-success { background: #E8F5E9; color: var(--success); border: 1px solid #C8E6C9; }
.alert-danger { background: #FFEAEA; color: var(--danger); border: 1px solid #FFCDD2; }
.tag-arrears { background: #FFEAEA; color: var(--danger); padding: 2px 8px; border-radius: 20px; font-size: 10px; font-weight: 700; }
.tag-ok { background: #E8F5E9; color: var(--success); padding: 2px 8px; border-radius: 20px; font-size: 10px; font-weight: 700; }
.wa-btn { background: #25D366; color: white; border: none; padding: 9px 14px; border-radius: 9px;
  font-size: 12px; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 5px;
  font-family: 'DM Sans', sans-serif; }
.wa-btn:hover { background: #128C7E; }
input[type=date] { color-scheme: light; }
::-webkit-scrollbar { width: 3px; height: 3px; }
::-webkit-scrollbar-thumb { background: var(--purple-pale); border-radius: 3px; }
`;

// ── SPLASH ───────────────────────────────────────────────────────────────────
function SplashScreen({ onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 3800); return () => clearTimeout(t); }, [onDone]);
  const particles = Array.from({ length: 18 }, (_, i) => ({
    left: `${Math.random() * 100}%`,
    width: `${4 + Math.random() * 8}px`,
    height: `${4 + Math.random() * 8}px`,
    animationDuration: `${3 + Math.random() * 4}s`,
    animationDelay: `${Math.random() * 2}s`,
  }));
  return (
    <div className="splash">
      <div className="splash-particles">
        {particles.map((p, i) => <div key={i} className="particle" style={p} />)}
      </div>
      <div className="splash-ring" />
      <div className="splash-ring" />
      <div className="splash-ring" />
      <div className="splash-logo-wrap">
        <div className="splash-icon">⛽</div>
        <div className="splash-title">MimiWORLD</div>
        <div className="splash-brand">FuelBridge Capitals</div>
        <div className="splash-divider" />
        <div className="splash-motto">Fueling Your Journey, Funding Your Future</div>
        <div className="splash-loader">
          <div className="splash-loader-bar"><div className="splash-loader-fill" /></div>
          <div className="splash-loader-text">Loading your world...</div>
        </div>
      </div>
    </div>
  );
}

// ── MAIN APP ─────────────────────────────────────────────────────────────────
export default function MimiWorld() {
  const [splash, setSplash] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);
  const [pw, setPw] = useState(""); const [pwErr, setPwErr] = useState("");
  const [tab, setTab] = useState("dashboard");
  const [data, setData] = useState(defaultData());
  const [modal, setModal] = useState(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setData(JSON.parse(raw));
    } catch(e) {}
  }, []);

  const save = (d) => {
    setData(d);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(d)); } catch(e) {}
  };
  const login = () => { if (pw === APP_PASSWORD) { setLoggedIn(true); setPwErr(""); } else setPwErr("Wrong password. Try again."); };

  return (
    <>
      <style>{styles}</style>
      {splash && <SplashScreen onDone={() => setSplash(false)} />}
      {!splash && !loggedIn && (
        <div className="login-wrap">
          <div className="login-card">
            <div className="login-logo">MimiWORLD</div>
            <div className="login-brand">FuelBridge Capitals</div>
            <div className="login-divider" />
            <input className="login-input" type="password" placeholder="Enter your password"
              value={pw} onChange={e => setPw(e.target.value)} onKeyDown={e => e.key === "Enter" && login()} />
            <button className="login-btn" onClick={login}>ENTER</button>
            {pwErr && <div className="login-err">{pwErr}</div>}
            <div className="login-motto">Fueling Your Journey, Funding Your Future</div>
          </div>
        </div>
      )}
      {!splash && loggedIn && (
        <div className="app-shell">
          <div className="top-bar">
            <div>
              <div className="top-logo">MimiWORLD</div>
              <div className="top-sub">FuelBridge Capitals</div>
            </div>
            <button className="logout-btn" onClick={() => setLoggedIn(false)}>Logout</button>
          </div>
          <div className="main">
            {tab === "dashboard" && <Dashboard data={data} save={save} setModal={setModal} today={todayStr()} />}
            {tab === "clients"   && <Clients   data={data} save={save} setModal={setModal} />}
            {tab === "loans"     && <Loans     data={data} save={save} setModal={setModal} today={todayStr()} />}
            {tab === "payments"  && <DailyPayments data={data} save={save} setModal={setModal} today={todayStr()} />}
            {tab === "arrears"   && <Arrears   data={data} save={save} setModal={setModal} today={todayStr()} />}
          </div>
          <div className="bottom-nav">
            {[
              { id:"dashboard", icon:"📊", label:"Home" },
              { id:"clients",   icon:"👥", label:"Clients" },
              { id:"loans",     icon:"💰", label:"Loans" },
              { id:"payments",  icon:"✅", label:"Payments" },
              { id:"arrears",   icon:"⚠️", label:"Arrears" },
            ].map(n => (
              <button key={n.id} className={`nav-item ${tab===n.id?"active":""}`} onClick={() => setTab(n.id)}>
                <div className="nav-active-bar" />
                <span className="nav-icon">{n.icon}</span>
                <span>{n.label}</span>
              </button>
            ))}
          </div>
          {modal && (
            <div className="modal-overlay" onClick={e => e.target===e.currentTarget && setModal(null)}>
              <div className="modal">
                <div className="modal-handle" />
                {modal.type==="addClient"     && <AddClientModal     data={data} save={save} close={() => setModal(null)} />}
                {modal.type==="addLoan"       && <AddLoanModal       data={data} save={save} close={() => setModal(null)} today={todayStr()} />}
                {modal.type==="clientDetail"  && <ClientDetailModal  data={data} save={save} close={() => setModal(null)} clientId={modal.payload} />}
                {modal.type==="recordPayment" && <RecordPaymentModal data={data} save={save} close={() => setModal(null)} loanId={modal.payload} today={todayStr()} />}
                {modal.type==="setBalance"    && <SetBalanceModal    data={data} save={save} close={() => setModal(null)} today={todayStr()} />}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}

// ── DASHBOARD ────────────────────────────────────────────────────────────────
function Dashboard({ data, save, setModal, today }) {
  const activeLoans = data.loans.filter(l => l.status !== "cleared");
  const arrears = activeLoans.filter(l => l.status === "arrears");
  const todayAccount = data.dailyAccounts.find(a => a.date === today);
  const prevAccount = (() => {
    const sorted = [...data.dailyAccounts].sort((a,b) => b.date.localeCompare(a.date));
    return sorted.find(a => a.date < today);
  })();
  const prevBalance = todayAccount?.openingBalance ?? (prevAccount ? prevAccount.closingBalance : 0);
  const moneyIn = data.loans.flatMap(l => l.payments||[]).filter(p => p.date===today).reduce((s,p)=>s+p.amount,0);
  const moneyOut = data.loans.filter(l => l.startDate===today).reduce((s,l)=>s+l.principal,0);
  const totalAvail = prevBalance + moneyIn;
  const closingBalance = totalAvail - moneyOut;
  const totalOwed = activeLoans.reduce((s,l)=>s+(l.totalAmount-(l.amountPaid||0)),0);

  return (
    <div>
      <div className="section-title">Dashboard</div>
      <div className="card card-hero" style={{marginBottom:14}}>
        <div className="hero-label">Today's Closing Balance</div>
        <div className="hero-value">{fmt(closingBalance)}</div>
        <div className="hero-date">{today}</div>
      </div>
      <div className="card" style={{marginBottom:14}}>
        <div style={{fontFamily:"'Cinzel',serif",fontSize:14,fontWeight:700,color:"var(--purple-deep)",marginBottom:12}}>Today's Account</div>
        <div className="account-row">
          <span className="account-label">Previous Balance</span>
          <span className="account-amount" style={{color:"var(--purple-mid)"}}>{fmt(prevBalance)}</span>
        </div>
        <div className="account-row">
          <span className="account-label">+ Money Received</span>
          <span className="account-amount" style={{color:"var(--success)"}}>{fmt(moneyIn)}</span>
        </div>
        <div className="account-avail">
          <span style={{fontWeight:700,fontSize:14,color:"var(--purple-deep)"}}>= Total Available</span>
          <span style={{fontFamily:"'Cinzel',serif",fontSize:15,fontWeight:700,color:"var(--purple-deep)"}}>{fmt(totalAvail)}</span>
        </div>
        <div className="account-row">
          <span className="account-label">− Money Given Out</span>
          <span className="account-amount" style={{color:"var(--danger)"}}>{fmt(moneyOut)}</span>
        </div>
        <div className="divider" />
        <div className="account-row account-total">
          <span className="account-label">= Closing Balance</span>
          <span className="account-amount">{fmt(closingBalance)}</span>
        </div>
        <button className="btn btn-outline btn-sm" style={{marginTop:10}} onClick={() => setModal({type:"setBalance"})}>
          ✏️ Set Opening Balance
        </button>
      </div>
      <div className="stat-grid">
        <div className="stat-card"><div className="stat-label">Active Loans</div><div className="stat-value">{activeLoans.length}</div></div>
        <div className="stat-card"><div className="stat-label">In Arrears</div><div className="stat-value danger">{arrears.length}</div></div>
        <div className="stat-card"><div className="stat-label">Total Clients</div><div className="stat-value">{data.clients.length}</div></div>
        <div className="stat-card"><div className="stat-label">Outstanding</div><div className="stat-value danger">{fmt(totalOwed)}</div></div>
      </div>
      {arrears.length > 0 && <div className="alert alert-danger">⚠️ {arrears.length} driver{arrears.length>1?"s":""} in arrears — check Arrears tab</div>}
      <div style={{display:"flex",gap:10}}>
        <button className="btn btn-primary" style={{flex:1}} onClick={() => setModal({type:"addLoan"})}>➕ New Loan</button>
        <button className="btn btn-gold" style={{flex:1}} onClick={() => setModal({type:"addClient"})}>👤 Add Client</button>
      </div>
    </div>
  );
}

// ── CLIENTS ──────────────────────────────────────────────────────────────────
function Clients({ data, save, setModal }) {
  const [search, setSearch] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const filtered = data.clients.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search));

  const doDelete = (clientId) => {
    const hasActiveLoans = data.loans.some(l => l.clientId === clientId && l.status !== "cleared");
    if (hasActiveLoans) {
      setConfirmDeleteId(null);
      alert("Cannot delete — this client has active loans. Clear their loans first.");
      return;
    }
    const updatedClients = data.clients.filter(c => c.id !== clientId);
    const updatedLoans = data.loans.filter(l => l.clientId !== clientId);
    setConfirmDeleteId(null);
    save({ ...data, clients: updatedClients, loans: updatedLoans });
  };

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <div className="section-title" style={{marginBottom:0}}>Clients</div>
        <button className="btn btn-gold btn-sm" onClick={() => setModal({type:"addClient"})}>+ Add</button>
      </div>
      <input className="form-input" placeholder="🔍 Search name or phone..." value={search} onChange={e=>setSearch(e.target.value)} style={{marginBottom:14}} />
      {filtered.length===0
        ? <div className="empty"><div className="empty-icon">👥</div><div className="empty-text">No clients yet. Add your first driver!</div></div>
        : filtered.map(c => {
          const active = data.loans.filter(l=>l.clientId===c.id&&l.status!=="cleared").length;
          const isConfirming = confirmDeleteId === c.id;
          return (
            <div key={c.id}>
              <div className="client-card" style={{marginBottom: isConfirming ? 0 : undefined}} onClick={() => !isConfirming && setModal({type:"clientDetail",payload:c.id})}>
                <div className="client-avatar">{c.name[0].toUpperCase()}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div className="client-name">{c.name}</div>
                  <div className="client-meta">{c.phone}{c.vehicle?` · ${c.vehicle}`:""}</div>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:6}}>
                  {active>0 ? <span className="tag-arrears">{active} loan{active>1?"s":""}</span> : <span className="tag-ok">Clear</span>}
                  <button
                    className="btn btn-danger btn-sm"
                    style={{padding:"5px 10px",fontSize:13,flexShrink:0}}
                    onClick={e => { e.stopPropagation(); setConfirmDeleteId(isConfirming ? null : c.id); }}
                  >{isConfirming ? "✕" : "🗑️"}</button>
                </div>
              </div>
              {isConfirming && (
                <div style={{background:"#FFEAEA",border:"1px solid #FFCDD2",borderRadius:"0 0 12px 12px",padding:"12px 14px",marginBottom:10}}>
                  <div style={{fontSize:13,color:"var(--danger)",fontWeight:600,marginBottom:10}}>
                    Delete <strong>{c.name}</strong>? This cannot be undone.
                  </div>
                  <div style={{display:"flex",gap:8}}>
                    <button className="btn btn-outline btn-sm" style={{flex:1}} onClick={() => setConfirmDeleteId(null)}>Cancel</button>
                    <button className="btn btn-sm" style={{flex:1,background:"var(--danger)",color:"white",border:"none"}} onClick={() => doDelete(c.id)}>Yes, Delete</button>
                  </div>
                </div>
              )}
            </div>
          );
        })
      }
    </div>
  );
}

// ── LOANS ────────────────────────────────────────────────────────────────────
function Loans({ data, save, setModal, today }) {
  const [filter, setFilter] = useState("active");
  const filtered = data.loans.filter(l =>
    filter==="all" ? true : filter==="active" ? l.status==="active" : filter==="arrears" ? l.status==="arrears" : l.status==="cleared"
  );
  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <div className="section-title" style={{marginBottom:0}}>Loans</div>
        <button className="btn btn-gold btn-sm" onClick={() => setModal({type:"addLoan"})}>+ New</button>
      </div>
      <div className="tabs">
        {["active","arrears","cleared","all"].map(f=>(
          <button key={f} className={`tab ${filter===f?"active":""}`} onClick={()=>setFilter(f)}>{f.charAt(0).toUpperCase()+f.slice(1)}</button>
        ))}
      </div>
      {filtered.length===0 ? <div className="empty"><div className="empty-icon">💰</div><div className="empty-text">No loans here</div></div>
        : filtered.map(loan=><LoanCard key={loan.id} loan={loan} data={data} setModal={setModal} today={today} />)
      }
    </div>
  );
}

function LoanCard({ loan, data, setModal, today }) {
  const client = data.clients.find(c=>c.id===loan.clientId);
  const paid = loan.amountPaid||0;
  const progress = Math.min(100, Math.round((paid/loan.totalAmount)*100));
  const remaining = loan.totalAmount - paid;
  const isOverdue = loan.endDate < today && loan.status!=="cleared";
  return (
    <div className="loan-card">
      <div className="loan-header">
        <div>
          <div className="loan-name">{client?.name||"Unknown"}</div>
          <div style={{fontSize:11,color:"rgba(255,255,255,0.45)",marginTop:1}}>{client?.phone}</div>
        </div>
        <span className={`loan-badge ${loan.status==="arrears"?"badge-arrears":loan.status==="cleared"?"badge-cleared":"badge-active"}`}>{loan.status}</span>
      </div>
      <div className="loan-body">
        <div className="loan-row"><span className="loan-key">Principal</span><span className="loan-val">{fmt(loan.principal)}</span></div>
        <div className="loan-row"><span className="loan-key">Interest (20%)</span><span className="loan-val gold">{fmt(loan.interest)}</span></div>
        <div className="loan-row"><span className="loan-key">Total</span><span className="loan-val" style={{fontFamily:"'Cinzel',serif"}}>{fmt(loan.totalAmount)}</span></div>
        <div className="loan-row"><span className="loan-key">Daily Payment</span><span className="loan-val gold">{fmt(loan.dailyAmount)}</span></div>
        <div className="divider" />
        <div className="loan-row"><span className="loan-key">Paid</span><span className="loan-val success">{fmt(paid)}</span></div>
        <div className="loan-row"><span className="loan-key">Remaining</span><span className={`loan-val ${remaining>0?"danger":"success"}`}>{fmt(remaining)}</span></div>
        <div className="progress-wrap"><div className="progress-bar" style={{width:`${progress}%`}} /></div>
        <div style={{fontSize:11,color:"var(--text-light)",marginBottom:8}}>{progress}% paid · Due {loan.endDate}</div>
        {isOverdue && <div className="alert alert-danger" style={{marginBottom:8}}>⚠️ Overdue!</div>}
        {loan.status!=="cleared" && (
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            <button className="btn btn-success btn-sm" onClick={()=>setModal({type:"recordPayment",payload:loan.id})}>💵 Record Payment</button>
            <a href={`https://wa.me/${client?.phone?.replace(/\D/g,"")}?text=${encodeURIComponent(`Hello ${client?.name}, this is a reminder from MimiWORLD - FuelBridge Capitals.\n\nYour daily payment of ${fmt(loan.dailyAmount)} is due today.\nTotal remaining: ${fmt(remaining)}.\n\nPlease make payment. Thank you! 🙏`)}`} target="_blank" rel="noreferrer">
              <button className="wa-btn">📲 WhatsApp</button>
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

// ── DAILY PAYMENTS ────────────────────────────────────────────────────────────
function DailyPayments({ data, save, setModal, today }) {
  const activeLoans = data.loans.filter(l=>l.status!=="cleared");
  const todayPaid = loanId => {
    const loan = data.loans.find(l=>l.id===loanId);
    return (loan?.payments||[]).filter(p=>p.date===today).reduce((s,p)=>s+p.amount,0);
  };
  return (
    <div>
      <div className="section-title">Daily Payments</div>
      <div className="card card-hero" style={{marginBottom:14}}>
        <div className="hero-label">Today</div>
        <div style={{fontFamily:"'Cinzel',serif",fontSize:18,color:"var(--gold-light)"}}>{today}</div>
      </div>
      {activeLoans.length===0 ? <div className="empty"><div className="empty-icon">✅</div><div className="empty-text">No active loans</div></div>
        : activeLoans.map(loan=>{
          const client = data.clients.find(c=>c.id===loan.clientId);
          const paidToday = todayPaid(loan.id);
          const isPaid = paidToday >= loan.dailyAmount;
          return (
            <div key={loan.id} className="card" style={{marginBottom:10}}>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:isPaid?0:10}}>
                <div className="client-avatar" style={{width:40,height:40,fontSize:15,borderRadius:12}}>{client?.name?.[0]?.toUpperCase()}</div>
                <div style={{flex:1}}>
                  <div style={{fontWeight:600,fontSize:14}}>{client?.name}</div>
                  <div style={{fontSize:12,color:"var(--gold)",fontWeight:700}}>Due: {fmt(loan.dailyAmount)}/day</div>
                  <div style={{fontSize:11,color:"var(--text-light)"}}>Remaining: {fmt(loan.totalAmount-(loan.amountPaid||0))}</div>
                </div>
                {isPaid ? <span className="tag-ok">✅ Paid</span> : <span className="tag-arrears">Unpaid</span>}
              </div>
              {!isPaid && (
                <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                  <button className="btn btn-success btn-sm" onClick={()=>setModal({type:"recordPayment",payload:loan.id})}>💵 Record</button>
                  <a href={`https://wa.me/${client?.phone?.replace(/\D/g,"")}?text=${encodeURIComponent(`Hello ${client?.name}, your payment of ${fmt(loan.dailyAmount)} is due today.\nPlease make payment. — MimiWORLD, FuelBridge Capitals`)}`} target="_blank" rel="noreferrer">
                    <button className="wa-btn">📲 Remind</button>
                  </a>
                </div>
              )}
            </div>
          );
        })
      }
    </div>
  );
}

// ── ARREARS ───────────────────────────────────────────────────────────────────
function Arrears({ data, save, setModal, today }) {
  const arrears = data.loans.filter(l=>l.status==="arrears");
  const applyPenalty = loanId => {
    const updated = data.loans.map(l => {
      if (l.id!==loanId) return l;
      const extra = Math.round(l.totalAmount*0.20);
      return {...l, totalAmount:l.totalAmount+extra, extraInterest:(l.extraInterest||0)+extra};
    });
    save({...data, loans:updated});
  };
  return (
    <div>
      <div className="section-title">Arrears</div>
      {arrears.length===0 ? <div className="empty"><div className="empty-icon">🎉</div><div className="empty-text">No arrears! All drivers on track.</div></div>
        : arrears.map(loan=>{
          const client = data.clients.find(c=>c.id===loan.clientId);
          const remaining = loan.totalAmount-(loan.amountPaid||0);
          const daysMissed = Math.max(0, workingDaysBetween(loan.lastPaymentDate||loan.startDate, today)-1);
          return (
            <div key={loan.id} className="loan-card">
              <div className="loan-header">
                <div><div className="loan-name">{client?.name}</div><div style={{fontSize:11,color:"rgba(255,255,255,0.45)"}}>{client?.phone}</div></div>
                <span className="loan-badge badge-arrears">ARREARS</span>
              </div>
              <div className="loan-body">
                <div className="loan-row"><span className="loan-key">Outstanding</span><span className="loan-val danger">{fmt(remaining)}</span></div>
                <div className="loan-row"><span className="loan-key">Total Amount</span><span className="loan-val">{fmt(loan.totalAmount)}</span></div>
                {loan.extraInterest>0 && <div className="loan-row"><span className="loan-key">Extra Penalty</span><span className="loan-val danger">{fmt(loan.extraInterest)}</span></div>}
                <div className="loan-row"><span className="loan-key">Days Overdue</span><span className="loan-val danger">{daysMissed} days</span></div>
                <div style={{display:"flex",gap:8,marginTop:10,flexWrap:"wrap"}}>
                  <button className="btn btn-success btn-sm" onClick={()=>setModal({type:"recordPayment",payload:loan.id})}>💵 Record</button>
                  <button className="btn btn-danger btn-sm" onClick={()=>applyPenalty(loan.id)}>➕ Penalty</button>
                  <a href={`https://wa.me/${client?.phone?.replace(/\D/g,"")}?text=${encodeURIComponent(`Hello ${client?.name}, your account with MimiWORLD - FuelBridge Capitals is in ARREARS.\n\nOutstanding: ${fmt(remaining)}\n\nPlease pay immediately to avoid further charges. Thank you.`)}`} target="_blank" rel="noreferrer">
                    <button className="wa-btn">📲 WhatsApp</button>
                  </a>
                </div>
              </div>
            </div>
          );
        })
      }
    </div>
  );
}

// ── MODALS ────────────────────────────────────────────────────────────────────
function AddClientModal({ data, save, close }) {
  const [form, setForm] = useState({name:"",phone:"",vehicle:"",address:""});
  const set = k => e => setForm(f=>({...f,[k]:e.target.value}));
  const submit = () => {
    if (!form.name||!form.phone) return alert("Name and phone are required");
    save({...data, clients:[...data.clients,{...form,id:data.nextClientId}], nextClientId:data.nextClientId+1});
    close();
  };
  return (
    <>
      <div className="modal-title">Add New Client</div>
      <div className="form-group"><label className="form-label">Full Name *</label><input className="form-input" placeholder="e.g. Kofi Mensah" value={form.name} onChange={set("name")} /></div>
      <div className="form-group"><label className="form-label">Phone Number *</label><input className="form-input" placeholder="e.g. 0244123456" value={form.phone} onChange={set("phone")} /></div>
      <div className="form-group"><label className="form-label">Vehicle Number</label><input className="form-input" placeholder="e.g. GR-1234-21" value={form.vehicle} onChange={set("vehicle")} /></div>
      <div className="form-group"><label className="form-label">Address</label><input className="form-input" placeholder="Optional" value={form.address} onChange={set("address")} /></div>
      <div className="row-flex">
        <button className="btn btn-outline btn-full" onClick={close}>Cancel</button>
        <button className="btn btn-gold btn-full" onClick={submit}>Save Client</button>
      </div>
    </>
  );
}

function AddLoanModal({ data, save, close, today }) {
  const [form, setForm] = useState({clientId:"",principal:"",startDate:today});
  const set = k => e => setForm(f=>({...f,[k]:e.target.value}));
  const principal = parseFloat(form.principal)||0;
  const interest = Math.round(principal*0.20);
  const total = principal+interest;
  const daily = total>0 ? parseFloat((total/5).toFixed(2)) : 0;
  const endDate = form.startDate ? addWorkingDays(form.startDate,5) : "";
  const submit = () => {
    if (!form.clientId) return alert("Please select a client");
    if (!form.principal||principal<=0) return alert("Enter a valid amount");
    const loan = {id:data.nextLoanId,clientId:parseInt(form.clientId),principal,interest,totalAmount:total,dailyAmount:daily,startDate:form.startDate,endDate,amountPaid:0,payments:[],status:"active",extraInterest:0};
    save({...data,loans:[...data.loans,loan],nextLoanId:data.nextLoanId+1});
    close();
  };
  return (
    <>
      <div className="modal-title">New Loan</div>
      <div className="form-group"><label className="form-label">Select Client *</label>
        <select className="form-select" value={form.clientId} onChange={set("clientId")}>
          <option value="">-- Choose a driver --</option>
          {data.clients.map(c=><option key={c.id} value={c.id}>{c.name} · {c.phone}</option>)}
        </select>
      </div>
      <div className="form-group"><label className="form-label">Amount Given (GHS) *</label><input className="form-input" type="number" placeholder="e.g. 200" value={form.principal} onChange={set("principal")} /></div>
      <div className="form-group"><label className="form-label">Start Date</label><input className="form-input" type="date" value={form.startDate} onChange={set("startDate")} /></div>
      {principal>0 && (
        <div className="calc-preview">
          <div style={{fontFamily:"'Cinzel',serif",fontSize:12,color:"var(--gold)",marginBottom:8,letterSpacing:1}}>AUTO CALCULATION</div>
          <div className="calc-row"><span>Principal</span><span>{fmt(principal)}</span></div>
          <div className="calc-row"><span>Interest (20%)</span><span>{fmt(interest)}</span></div>
          <div className="calc-row"><span>Total to Repay</span><span>{fmt(total)}</span></div>
          <div className="calc-row"><span>Daily × 5 days</span><span>{fmt(daily)}</span></div>
          <div className="calc-row total"><span>Due Date</span><span>{endDate}</span></div>
        </div>
      )}
      <div className="row-flex">
        <button className="btn btn-outline btn-full" onClick={close}>Cancel</button>
        <button className="btn btn-primary btn-full" onClick={submit}>Create Loan</button>
      </div>
    </>
  );
}

function RecordPaymentModal({ data, save, close, loanId, today }) {
  const loan = data.loans.find(l=>l.id===loanId);
  const client = data.clients.find(c=>c.id===loan?.clientId);
  const [amount, setAmount] = useState(loan?.dailyAmount?.toString()||"");
  const [date, setDate] = useState(today);
  const [note, setNote] = useState("");
  if (!loan) return null;
  const remaining = loan.totalAmount-(loan.amountPaid||0);
  const submit = () => {
    const amt = parseFloat(amount);
    if (!amt||amt<=0) return alert("Enter a valid amount");
    const payment = {id:data.nextPaymentId,loanId,amount:amt,date,note};
    const newPaid = (loan.amountPaid||0)+amt;
    const newRemaining = loan.totalAmount-newPaid;
    let newStatus = newRemaining<=0 ? "cleared" : date>loan.endDate ? "arrears" : "active";
    const updatedLoans = data.loans.map(l=>l.id===loanId ? {...l,amountPaid:newPaid,payments:[...(l.payments||[]),payment],status:newStatus,lastPaymentDate:date} : l);
    save({...data,loans:updatedLoans,payments:[...data.payments,payment],nextPaymentId:data.nextPaymentId+1});
    close();
  };
  return (
    <>
      <div className="modal-title">Record Payment</div>
      <div className="card" style={{marginBottom:14,background:"var(--purple-pale)"}}>
        <div style={{fontWeight:700,fontSize:15,color:"var(--purple-deep)"}}>{client?.name}</div>
        <div style={{fontSize:13,color:"var(--text-mid)",marginTop:4}}>Outstanding: <strong>{fmt(remaining)}</strong> · Daily: <strong>{fmt(loan.dailyAmount)}</strong></div>
      </div>
      <div className="form-group"><label className="form-label">Amount Paid (GHS)</label><input className="form-input" type="number" value={amount} onChange={e=>setAmount(e.target.value)} /><div className="form-hint">Default is daily — change if different</div></div>
      <div className="form-group"><label className="form-label">Payment Date</label><input className="form-input" type="date" value={date} onChange={e=>setDate(e.target.value)} /></div>
      <div className="form-group"><label className="form-label">Note (optional)</label><input className="form-input" placeholder="e.g. Paid via MoMo" value={note} onChange={e=>setNote(e.target.value)} /></div>
      <div className="row-flex">
        <button className="btn btn-outline btn-full" onClick={close}>Cancel</button>
        <button className="btn btn-success btn-full" onClick={submit}>✅ Save Payment</button>
      </div>
    </>
  );
}

function SetBalanceModal({ data, save, close, today }) {
  const existing = data.dailyAccounts.find(a=>a.date===today);
  const [balance, setBalance] = useState(existing?.openingBalance?.toString()||"");
  const [saved, setSaved] = useState(false);
  const submit = () => {
    const amt = parseFloat(balance);
    if (isNaN(amt) || balance === "") { alert("Please enter a valid amount"); return; }
    const updated = data.dailyAccounts.filter(a=>a.date!==today);
    const newEntry = {date:today, openingBalance:amt, closingBalance:amt};
    const newData = {...data, dailyAccounts:[...updated, newEntry]};
    save(newData);
    setSaved(true);
    setTimeout(() => close(), 1000);
  };
  return (
    <>
      <div className="modal-title">Set Opening Balance</div>
      {saved ? (
        <div className="alert alert-success" style={{textAlign:"center",fontSize:15,padding:20}}>
          ✅ Balance set to {fmt(parseFloat(balance))}!
        </div>
      ) : (
        <>
          <div className="form-group">
            <label className="form-label">Opening Balance (GHS)</label>
            <input className="form-input" type="number" placeholder="e.g. 500" value={balance} onChange={e=>setBalance(e.target.value)} />
            <div className="form-hint">Enter the cash balance you are starting today with</div>
          </div>
          {balance !== "" && !isNaN(parseFloat(balance)) && (
            <div className="calc-preview" style={{marginBottom:14}}>
              <div className="calc-row"><span>Opening Balance</span><span style={{color:"var(--gold)",fontWeight:700}}>{fmt(parseFloat(balance))}</span></div>
            </div>
          )}
          <div className="row-flex">
            <button className="btn btn-outline btn-full" onClick={close}>Cancel</button>
            <button className="btn btn-primary btn-full" onClick={submit}>✅ Set Balance</button>
          </div>
        </>
      )}
    </>
  );
}

function ClientDetailModal({ data, save, close, clientId }) {
  const client = data.clients.find(c=>c.id===clientId);
  const loans = data.loans.filter(l=>l.clientId===clientId);
  if (!client) return null;
  const totalBorrowed = loans.reduce((s,l)=>s+l.principal,0);
  const totalPaid = loans.reduce((s,l)=>s+(l.amountPaid||0),0);
  const totalOwed = loans.reduce((s,l)=>s+(l.totalAmount-(l.amountPaid||0)),0);
  return (
    <>
      <div className="modal-title">{client.name}</div>
      <div className="card" style={{background:"var(--purple-pale)",marginBottom:14}}>
        <div style={{fontSize:14,color:"var(--text-mid)"}}>📞 {client.phone}</div>
        {client.vehicle && <div style={{fontSize:14,color:"var(--text-mid)",marginTop:4}}>🚗 {client.vehicle}</div>}
        {client.address && <div style={{fontSize:14,color:"var(--text-mid)",marginTop:4}}>📍 {client.address}</div>}
      </div>
      <div className="stat-grid" style={{marginBottom:14}}>
        <div className="stat-card"><div className="stat-label">Total Loans</div><div className="stat-value">{loans.length}</div></div>
        <div className="stat-card"><div className="stat-label">Total Owed</div><div className="stat-value danger">{fmt(totalOwed)}</div></div>
        <div className="stat-card"><div className="stat-label">Borrowed</div><div className="stat-value">{fmt(totalBorrowed)}</div></div>
        <div className="stat-card"><div className="stat-label">Paid Back</div><div className="stat-value success">{fmt(totalPaid)}</div></div>
      </div>
      <div style={{fontFamily:"'Cinzel',serif",fontSize:13,color:"var(--purple-deep)",marginBottom:10}}>LOAN HISTORY</div>
      {loans.length===0 ? <div className="empty" style={{padding:20}}><div className="empty-text">No loans yet</div></div>
        : loans.map(l=>(
          <div key={l.id} className="card" style={{marginBottom:8}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
              <span style={{fontSize:12,color:"var(--text-light)"}}>Started {l.startDate}</span>
              <span className={`loan-badge ${l.status==="arrears"?"badge-arrears":l.status==="cleared"?"badge-cleared":"badge-active"}`} style={{fontSize:9}}>{l.status}</span>
            </div>
            <div style={{display:"flex",justifyContent:"space-between"}}>
              <span style={{fontSize:13}}>Principal: <strong>{fmt(l.principal)}</strong></span>
              <span style={{fontSize:13,color:"var(--gold)"}}>Total: <strong>{fmt(l.totalAmount)}</strong></span>
            </div>
            <div style={{fontSize:12,color:"var(--success)",marginTop:3}}>Paid: {fmt(l.amountPaid||0)} · Left: {fmt(l.totalAmount-(l.amountPaid||0))}</div>
          </div>
        ))
      }
      <div className="row-flex" style={{marginTop:8}}>
        <button className="btn btn-outline btn-full" onClick={close}>Close</button>
        <button className="btn btn-danger btn-full" onClick={() => {
          const hasActiveLoans = data.loans.some(l => l.clientId === clientId && l.status !== "cleared");
          if (hasActiveLoans) return alert("Cannot delete — client has active loans. Clear all loans first.");
          if (!window.confirm(`Delete ${client.name}? This cannot be undone.`)) return;
          save({ ...data, clients: data.clients.filter(c => c.id !== clientId), loans: data.loans.filter(l => l.clientId !== clientId) });
          close();
        }}>🗑️ Delete</button>
      </div>
    </>
  );
}
