'use client';

import { Shield, FileText, MessageSquare, Gamepad2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function TermsOfServicePage() {
  const { t } = useLanguage();
  return (
    <div className="diamonds-page">
      {/* Header */}
      <div className="diamonds-hero">
        <div className="diamonds-hero-bg">
          <div className="diamond-float d1 text-4xl opacity-80 drop-shadow-[0_0_15px_rgba(255,46,147,0.5)]">📜</div>
          <div className="diamond-float d2 text-3xl opacity-80 drop-shadow-[0_0_15px_rgba(161,44,255,0.4)]">⚖️</div>
          <div className="diamond-float d3 text-4xl opacity-80 drop-shadow-[0_0_15px_rgba(0,229,255,0.5)]">🛡️</div>
        </div>
        <h1 className="diamonds-title flex items-center justify-center gap-3">
          {t("Terms of Service", "ဝန်ဆောင်မှုဆိုင်ရာ စည်းမျဉ်းများ")}
        </h1>
        <p className="diamonds-subtitle">{t("Please read these terms carefully before using PanneiStore.", "PanneiStore ကို မသုံးစွဲမီ ဤစည်းမျဉ်းများကို သေချာစွာ ဖတ်ရှုပါ။")}</p>
      </div>

      <div className="diamonds-body" style={{ maxWidth: '800px', margin: '0 auto', width: '100%', paddingBottom: '120px' }}>
        
        {/* Section 1 */}
        <div className="diamonds-section">
          <h2 className="section-heading">
            <span className="step-num"><FileText size={18} /></span> {t("Account Trading Rules", "အကောင့်အရောင်းအဝယ် စည်းမျဉ်းများ")}
          </h2>
          <div className="theme-muted text-[15px] leading-relaxed space-y-4 pl-2 md:pl-12">
            <p>{t("To maintain a safe and secure marketplace for Mobile Legends accounts, all users must adhere to the following trading rules:", "Mobile Legends အကောင့်များအတွက် လုံခြုံသော စျေးကွက်တစ်ခုဖြစ်စေရန် အသုံးပြုသူများအားလုံး အောက်ပါစည်းမျဉ်းများကို လိုက်နာရမည်-")}</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong className="theme-heading">{t("Escrow Only:", "ကြားခံစနစ်ဖြင့်သာ-")}</strong> {t("All trades must go through our official escrow process. Conducting transactions outside the platform voids all security guarantees.", "အရောင်းအဝယ်အားလုံးကို ကျွန်ုပ်တို့၏ တရားဝင် ကြားခံစနစ်မှတစ်ဆင့်သာ ပြုလုပ်ရမည်။ ပလက်ဖောင်းပြင်ပတွင် ပြုလုပ်သော အရောင်းအဝယ်များအတွက် လုံခြုံရေးအာမခံချက် ပျက်ပြယ်မည်ဖြစ်သည်။")}</li>
              <li><strong className="theme-heading">{t("Full Access Required:", "အကောင့် အပြည့်အစုံပေးရန်-")}</strong> {t("Sellers are required to provide full access (Email, Password, and Moonton bindings) to the buyer before funds are released.", "ရောင်းချသူများသည် ဝယ်သူထံ ငွေမလွှဲမီ အကောင့်အချက်အလက်အပြည့်အစုံ (အီးမေးလ်၊ စကားဝှက်၊ Moonton အချက်အလက်များ) ကို ပေးအပ်ရမည်။")}</li>
              <li><strong className="theme-heading">{t("Verification:", "စစ်ဆေးအတည်ပြုခြင်း-")}</strong> {t("PanneiStore admins will verify the account details before proceeding with the handover process.", "လွှဲပြောင်းမှုမစတင်မီ PanneiStore မှ တာဝန်ရှိသူများက အကောင့်အချက်အလက်များကို စစ်ဆေးအတည်ပြုမည်ဖြစ်သည်။")}</li>
            </ul>
          </div>
        </div>

        {/* Section 2 */}
        <div className="diamonds-section mt-12">
          <h2 className="section-heading">
            <span className="step-num"><Gamepad2 size={18} /></span> {t("Diamond Top-Up Policy", "စိန်ဖြည့်ခြင်းဆိုင်ရာ မူဝါဒ")}
          </h2>
          <div className="theme-muted text-[15px] leading-relaxed space-y-4 pl-2 md:pl-12">
            <p>{t("Our top-up service is designed to be instant, but certain conditions apply to all purchases:", "ကျွန်ုပ်တို့၏ စိန်ဖြည့်ဝန်ဆောင်မှုကို ချက်ချင်းရရှိရန် စီစဉ်ထားသော်လည်း အောက်ပါအချက်များကို လိုက်နာရမည်-")}</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong className="theme-heading">{t("Non-Refundable:", "ငွေပြန်မအမ်းပါ-")}</strong> {t("Diamond top-ups are strictly non-refundable once the transaction is completed on the server.", "ဆာဗာပေါ်တွင် လုပ်ငန်းစဉ်ပြီးဆုံးပါက စိန်ဖြည့်ခြင်းအတွက် ငွေပြန်အမ်းမည်မဟုတ်ပါ။")}</li>
              <li><strong className="theme-heading">{t("Accuracy of Information:", "အချက်အလက် မှန်ကန်မှု-")}</strong> {t("You are fully responsible for ensuring your User ID and Zone ID are correct. We cannot refund or reverse diamonds sent to the wrong ID.", "သင်၏ User ID နှင့် Zone ID မှန်ကန်မှုရှိစေရန် သင့်တွင် အပြည့်အဝတာဝန်ရှိသည်။ အချက်အလက်မှားယွင်းမှုကြောင့်ဖြစ်ပေါ်လာသော ဆုံးရှုံးမှုများကို တာဝန်ယူမည်မဟုတ်ပါ။")}</li>
              <li><strong className="theme-heading">{t("Processing Times:", "ကြာမြင့်ချိန်-")}</strong> {t("Orders typically complete within 1-5 minutes, but may experience slight delays during official game maintenance or server overloads.", "ပုံမှန်အားဖြင့် ၁ မိနစ်မှ ၅ မိနစ်အတွင်း ပြီးစီးမည်ဖြစ်သော်လည်း ဂိမ်းဆာဗာ ထိန်းသိမ်းမှုများရှိပါက အနည်းငယ်ကြန့်ကြာနိုင်ပါသည်။")}</li>
            </ul>
          </div>
        </div>

        {/* Section 3 */}
        <div className="diamonds-section mt-12">
          <h2 className="section-heading">
            <span className="step-num"><Shield size={18} /></span> {t("User Conduct", "အသုံးပြုသူ လိုက်နာရမည့် ကျင့်ဝတ်")}
          </h2>
          <div className="theme-muted text-[15px] leading-relaxed space-y-4 pl-2 md:pl-12">
            <p>{t("We enforce a strict zero-tolerance policy against malicious behavior:", "ကျွန်ုပ်တို့သည် မသမာသော လုပ်ရပ်များအပေါ် လုံးဝ သည်းခံမည်မဟုတ်ပါ-")}</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>{t("Scams, fraud, or any attempts to bypass the PanneiStore escrow system will result in an immediate and permanent ban.", "လိမ်လည်မှုများ သို့မဟုတ် PanneiStore ကြားခံစနစ်ကို ကျော်လွန်ရန် ကြိုးပမ်းမှုများကို ချက်ချင်းနှင့် ထာဝရ ပိတ်ပင်မည်ဖြစ်သည်။")}</li>
              <li>{t("Treat all buyers, sellers, and our support staff with respect. Harassment will not be tolerated.", "ဝယ်သူ၊ ရောင်းသူများနှင့် ကျွန်ုပ်တို့၏ ဝန်ထမ်းများကို လေးစားမှုရှိပါ။ နှောင့်ယှက်မှုများကို သည်းခံမည်မဟုတ်ပါ။")}</li>
              <li>{t("Providing fake proof of payment or attempting chargeback fraud will lead to legal action and a permanent ban.", "ငွေလွှဲအထောက်အထား အတုများပေးခြင်း သို့မဟုတ် လိမ်လည်မှုများပြုလုပ်ပါက ဥပဒေအရ အရေးယူမည်ဖြစ်ပြီး အကောင့်ကို ထာဝရ ပိတ်ပင်မည်ဖြစ်သည်။")}</li>
            </ul>
            <p className="mt-6 text-brand-pink font-semibold">
              {t("By using PanneiStore, you agree to abide by these rules to help keep our community safe.", "PanneiStore ကို အသုံးပြုခြင်းအားဖြင့် သင်သည် ဤစည်းမျဉ်းများကို လိုက်နာရန် သဘောတူညီပြီးဖြစ်သည်။")}
            </p>
          </div>
        </div>

        {/* Section 4 / Contact */}
        <div className="diamonds-section mt-12 mb-8">
          <h2 className="section-heading">
            <span className="step-num"><MessageSquare size={18} /></span> {t("Questions about these terms?", "စည်းမျဉ်းများနှင့် ပတ်သက်၍ မေးမြန်းလိုပါသလား။")}
          </h2>
          <div className="theme-muted text-[15px] leading-relaxed space-y-6 pl-2 md:pl-12">
            <p>
              {t("If you have any questions regarding our Terms of Service or need clarification on our trading rules, please contact our administrative team.", "ဝန်ဆောင်မှုဆိုင်ရာ စည်းမျဉ်းများ သို့မဟုတ် အရောင်းအဝယ် စည်းမျဉ်းများနှင့် ပတ်သက်၍ မေးမြန်းလိုပါက ကျွန်ုပ်တို့၏ စီမံခန့်ခွဲမှုအဖွဲ့ထံ ဆက်သွယ်နိုင်ပါသည်။")}
            </p>
            <div>
              <a 
                href="https://t.me/Panneisan2002" 
                target="_blank" 
                rel="noreferrer"
                className="hero-cta hero-cta-secondary inline-flex items-center justify-center gap-2 px-6 py-3 text-[14px]"
              >
                <MessageSquare size={16} className="fill-brand-pink/20" /> {t("Contact Support on Telegram", "Telegram တွင် ဆက်သွယ်ရန်")}
              </a>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-4 mt-24 pt-12 border-t border-[var(--card-border)]/50">
          <p className="theme-muted text-[14px]">
            {t("Last updated on", "နောက်ဆုံးပြင်ဆင်ခဲ့သော ရက်စွဲ -")} <span className="font-medium theme-heading">{new Date().toLocaleDateString(t('en-US', 'my-MM'), { month: 'long', day: 'numeric', year: 'numeric' })}</span>
          </p>
        </div>

      </div>
    </div>
  );
}
