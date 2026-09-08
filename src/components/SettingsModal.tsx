'use client';

import React, { useState } from 'react';
import { AppSettings, PersonId } from '@/types/budget';
import { X, Plus, Trash2, Cloud, Check } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSaveSettings: (settings: AppSettings) => void;
  onConnectFirebase: (configStr: string) => void;
  isCloudConnected: boolean;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  onConnectFirebase,
  isCloudConnected,
}) => {
  const [activeTab, setActiveTab] = useState<'fixed_template' | 'persons' | 'cloud'>('fixed_template');

  // Sabit şablonlar
  const [templates, setTemplates] = useState(settings.defaultFixedExpenses || []);
  const [newTitle, setNewTitle] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newPerson, setNewPerson] = useState<PersonId>('ortak');
  const [newCategory, setNewCategory] = useState('fatura');
  const [newDueDate, setNewDueDate] = useState('15');

  // Firebase Config JSON / Input
  const [firebaseInput, setFirebaseInput] = useState('');
  const [cloudSuccessMsg, setCloudSuccessMsg] = useState(false);

  if (!isOpen) return null;

  const handleAddTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const updated = [
      ...templates,
      {
        title: newTitle.trim(),
        expectedAmount: parseFloat(newAmount) || 0,
        categoryId: newCategory,
        personId: newPerson,
        dueDate: parseInt(newDueDate, 10) || 15,
      }
    ];
    setTemplates(updated);
    onSaveSettings({ ...settings, defaultFixedExpenses: updated });

    setNewTitle('');
    setNewAmount('');
  };

  const handleDeleteTemplate = (index: number) => {
    const updated = templates.filter((_, i) => i !== index);
    setTemplates(updated);
    onSaveSettings({ ...settings, defaultFixedExpenses: updated });
  };

  const handleSaveFirebase = () => {
    if (!firebaseInput.trim()) return;
    onConnectFirebase(firebaseInput.trim());
    setCloudSuccessMsg(true);
    setTimeout(() => setCloudSuccessMsg(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-xl border border-zinc-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Üst Bar */}
        <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50">
          <h3 className="font-bold text-base text-zinc-900">Ayarlar ve Şablonlar</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sekmeler */}
        <div className="flex border-b border-zinc-200 px-5 pt-2 gap-4 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('fixed_template')}
            className={`pb-2.5 transition border-b-2 cursor-pointer ${
              activeTab === 'fixed_template'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            Her Ay Otomatik Gelen Faturalar
          </button>

          <button
            onClick={() => setActiveTab('persons')}
            className={`pb-2.5 transition border-b-2 cursor-pointer ${
              activeTab === 'persons'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            Kişiler
          </button>

          <button
            onClick={() => setActiveTab('cloud')}
            className={`pb-2.5 transition border-b-2 cursor-pointer ${
              activeTab === 'cloud'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            Bulut (Firebase)
          </button>
        </div>

        {/* İçerik */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          
          {/* 1. Sabit Şablonlar */}
          {activeTab === 'fixed_template' && (
            <div className="space-y-4">
              <p className="text-xs text-zinc-500">
                Buradaki faturalar ve sabit giderler, her yeni aya geçtiğinizde listenize otomatik olarak eklenir. Annenizin her ay tekrar tekrar aynı şeyleri yazmasına gerek kalmaz.
              </p>

              {/* Yeni Şablon Ekleme */}
              <form onSubmit={handleAddTemplate} className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl space-y-2 text-xs">
                <div className="font-semibold text-zinc-800">Listeye Yeni Sabit Gider Ekle</div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Gider Adı (Kira, Elektrik...)"
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    required
                    className="px-2.5 py-1.5 border border-zinc-300 rounded-lg bg-white"
                  />
                  <input
                    type="number"
                    step="any"
                    placeholder="Standart Tutar (TL)"
                    value={newAmount}
                    onChange={e => setNewAmount(e.target.value)}
                    className="px-2.5 py-1.5 border border-zinc-300 rounded-lg bg-white"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <select
                    value={newPerson}
                    onChange={e => setNewPerson(e.target.value)}
                    className="px-2 py-1.5 border border-zinc-300 rounded-lg bg-white"
                  >
                    {settings.persons.map(p => (
                      <option key={p.id} value={p.id}>{p.avatar} {p.name}</option>
                    ))}
                  </select>

                  <select
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value)}
                    className="px-2 py-1.5 border border-zinc-300 rounded-lg bg-white"
                  >
                    {settings.categories.map(c => (
                      <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                    ))}
                  </select>

                  <input
                    type="number"
                    min="1"
                    max="31"
                    placeholder="Vade Günü"
                    value={newDueDate}
                    onChange={e => setNewDueDate(e.target.value)}
                    className="px-2 py-1.5 border border-zinc-300 rounded-lg bg-white"
                  />
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Şablona Ekle
                  </button>
                </div>
              </form>

              {/* Mevcut Şablon Listesi */}
              <div className="divide-y divide-zinc-200 border border-zinc-200 rounded-xl overflow-hidden bg-white text-xs">
                {templates.map((tpl, i) => (
                  <div key={i} className="p-3 flex items-center justify-between hover:bg-zinc-50">
                    <div>
                      <div className="font-semibold text-zinc-900">{tpl.title}</div>
                      <div className="text-[11px] text-zinc-500 mt-0.5">
                        Ayın {tpl.dueDate || 15}. günü • Sorumlu: {settings.persons.find(p => p.id === tpl.personId)?.name}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-zinc-800">
                        {tpl.expectedAmount ? `${tpl.expectedAmount.toLocaleString('tr-TR')} ₺` : 'Değişken'}
                      </span>
                      <button
                        onClick={() => handleDeleteTemplate(i)}
                        className="text-zinc-300 hover:text-rose-600 transition p-1 cursor-pointer"
                        title="Şablondan kaldır"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. Kişiler */}
          {activeTab === 'persons' && (
            <div className="space-y-3">
              <p className="text-xs text-zinc-500">
                Evde harcama yapan aile bireyleri. Harcama ve gelirler bu kişilere göre gruplanır.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {settings.persons.map(p => (
                  <div key={p.id} className="p-3 rounded-xl border border-zinc-200 flex items-center gap-3 bg-white">
                    <span className="text-2xl">{p.avatar}</span>
                    <div>
                      <div className="text-xs font-bold text-zinc-900">{p.name}</div>
                      <div className="text-[11px] text-zinc-500">{p.role || 'Birey'}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. Bulut (Firebase) */}
          {activeTab === 'cloud' && (
            <div className="space-y-4 text-xs">
              <div className={`p-4 rounded-xl border flex items-start gap-3 ${
                isCloudConnected ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-zinc-50 border-zinc-200 text-zinc-700'
              }`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  isCloudConnected ? 'bg-emerald-200 text-emerald-800' : 'bg-zinc-200 text-zinc-600'
                }`}>
                  <Cloud className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-sm">
                    {isCloudConnected ? 'Bulut Senkronizasyonu Aktif' : 'Yerel Hafıza Modundasınız'}
                  </div>
                  <p className="mt-0.5 text-zinc-600">
                    {isCloudConnected
                      ? 'Verileriniz Google Firebase Firestore ile güvende. Telefon ve bilgisayarınız otomatik senkronize olur.'
                      : 'Şu anda tüm veriler bu cihazın tarayıcısında güvenle saklanıyor. Telefon ve bilgisayarı eşitlemek isterseniz Firebase ayarlarınızı aşağıya yapıştırabilirsiniz.'}
                  </p>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-zinc-700 mb-1">
                  Firebase Web Yapılandırma Kodu (JSON formatında):
                </label>
                <textarea
                  rows={6}
                  placeholder={`{\n  "apiKey": "AIzaSy...",\n  "authDomain": "proje.firebaseapp.com",\n  "projectId": "proje-id",\n  "storageBucket": "proje.firebasestorage.app",\n  "messagingSenderId": "...",\n  "appId": "..."\n}`}
                  value={firebaseInput}
                  onChange={e => setFirebaseInput(e.target.value)}
                  className="w-full p-2.5 text-xs font-mono border border-zinc-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-zinc-50"
                />
              </div>

              {cloudSuccessMsg && (
                <div className="p-2.5 rounded-lg bg-emerald-100 text-emerald-800 flex items-center gap-2 font-medium">
                  <Check className="w-4 h-4" /> Firebase ayarları kaydedildi ve bağlandı!
                </div>
              )}

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleSaveFirebase}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition cursor-pointer"
                >
                  Firebase Bilgilerini Kaydet
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
