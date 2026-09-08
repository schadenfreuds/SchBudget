'use client';

import React, { useState } from 'react';
import { AppSettings, PersonId, Person } from '@/types/budget';
import { X, Plus, Trash2, Cloud, Check, UserPlus } from 'lucide-react';
import { formatAmountInput, parseFormattedAmount } from '@/lib/formatters';

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
  const [newDueDate, setNewDueDate] = useState('');

  // Kişiler
  const [persons, setPersons] = useState<Person[]>(settings.persons || []);
  const [newPersonName, setNewPersonName] = useState('');
  const [newPersonRole, setNewPersonRole] = useState('');
  const [newPersonAvatar, setNewPersonAvatar] = useState('👩');
  const [newPersonColor, setNewPersonColor] = useState('bg-indigo-100 text-indigo-700 border-indigo-200');

  const COLOR_OPTIONS = [
    { label: 'Gül', value: 'bg-rose-100 text-rose-700 border-rose-200' },
    { label: 'Mavi', value: 'bg-blue-100 text-blue-700 border-blue-200' },
    { label: 'Zümrüt', value: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    { label: 'Kehribar', value: 'bg-amber-100 text-amber-700 border-amber-200' },
    { label: 'Mor', value: 'bg-purple-100 text-purple-700 border-purple-200' },
    { label: 'İndigo', value: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
    { label: 'Camgöbeği', value: 'bg-teal-100 text-teal-700 border-teal-200' },
  ];

  const AVATAR_OPTIONS = ['👩', '👨', '👦', '👧', '🐱', '🐶', '🏠'];

  const handleAddPerson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPersonName.trim()) return;

    const newId = `person_${Date.now()}`;
    const updatedPersons: Person[] = [
      ...persons,
      {
        id: newId,
        name: newPersonName.trim(),
        role: newPersonRole.trim() || undefined,
        avatar: newPersonAvatar || '🧑',
        color: newPersonColor,
      }
    ];
    setPersons(updatedPersons);
    onSaveSettings({ ...settings, persons: updatedPersons });
    setNewPersonName('');
    setNewPersonRole('');
  };

  const handleDeletePerson = (id: string) => {
    if (id === 'ortak' || persons.length <= 1) return;
    const updatedPersons = persons.filter(p => p.id !== id);
    setPersons(updatedPersons);
    onSaveSettings({ ...settings, persons: updatedPersons });
  };

  const handleUpdatePerson = (id: string, field: 'name' | 'role' | 'avatar', value: string) => {
    const updatedPersons = persons.map(p => {
      if (p.id === id) {
        return { ...p, [field]: value };
      }
      return p;
    });
    setPersons(updatedPersons);
    onSaveSettings({ ...settings, persons: updatedPersons });
  };

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
        expectedAmount: parseFormattedAmount(newAmount) || 0,
        categoryId: newCategory,
        personId: newPerson,
        dueDate: newDueDate ? (parseInt(newDueDate, 10) || 15) : undefined,
      }
    ];
    setTemplates(updated);
    onSaveSettings({ ...settings, defaultFixedExpenses: updated });

    setNewTitle('');
    setNewAmount('');
    setNewDueDate('');
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
              <form onSubmit={handleAddTemplate} className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl space-y-3 text-xs">
                <div className="font-bold text-zinc-900 text-sm">Listeye Yeni Sabit Gider Ekle</div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-700 mb-1">
                      Sabit Gider / Fatura Adı *
                    </label>
                    <input
                      type="text"
                      placeholder="Örn: Kira, Elektrik, İnternet"
                      value={newTitle}
                      onChange={e => setNewTitle(e.target.value)}
                      required
                      className="w-full px-2.5 py-1.5 border border-zinc-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-700 mb-1">
                      Standart Tutar (₺)
                    </label>
                    <input
                      type="text"
                      inputMode="decimal"
                      placeholder="0 (Değişkense boş bırakın)"
                      value={newAmount}
                      onChange={e => setNewAmount(formatAmountInput(e.target.value))}
                      className="w-full px-2.5 py-1.5 border border-zinc-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-700 mb-1">
                      Sorumlu Kişi
                    </label>
                    <select
                      value={newPerson}
                      onChange={e => setNewPerson(e.target.value)}
                      className="w-full px-2 py-1.5 border border-zinc-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    >
                      {settings.persons.map(p => (
                        <option key={p.id} value={p.id}>{p.avatar} {p.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-700 mb-1">
                      Kategori
                    </label>
                    <select
                      value={newCategory}
                      onChange={e => setNewCategory(e.target.value)}
                      className="w-full px-2 py-1.5 border border-zinc-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    >
                      {settings.categories.map(c => (
                        <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-700 mb-1">
                      Son Ödeme Günü (Ayın Kaçı)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="31"
                      placeholder="Örn: 15 (İsteğe bağlı)"
                      value={newDueDate}
                      onChange={e => setNewDueDate(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-zinc-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition cursor-pointer"
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
            <div className="space-y-4 text-xs">
              <p className="text-zinc-500">
                Evde harcama yapan aile bireyleri. İstediğiniz kişiyi ekleyebilir, ismini veya rolünü değiştirebilirsiniz.
              </p>

              {/* Yeni Kişi Ekleme Formu */}
              <form onSubmit={handleAddPerson} className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl space-y-3">
                <div className="font-bold text-zinc-900 text-sm flex items-center gap-1.5">
                  <UserPlus className="w-4 h-4 text-emerald-600" />
                  Yeni Birey / Kişi Ekle
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-700 mb-1">
                      Kişi Adı *
                    </label>
                    <input
                      type="text"
                      placeholder="Örn: Ayşe, Mehmet"
                      value={newPersonName}
                      onChange={e => setNewPersonName(e.target.value)}
                      required
                      className="w-full px-2.5 py-1.5 border border-zinc-300 rounded-lg bg-white text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-700 mb-1">
                      Rol / Tanım (Opsiyonel)
                    </label>
                    <input
                      type="text"
                      placeholder="Örn: Anne, Çocuk, Ortak"
                      value={newPersonRole}
                      onChange={e => setNewPersonRole(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-zinc-300 rounded-lg bg-white text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-semibold text-zinc-700 mr-1">İkon:</span>
                    {AVATAR_OPTIONS.map(emoji => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setNewPersonAvatar(emoji)}
                        className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition active:scale-95 cursor-pointer ${
                          newPersonAvatar === emoji
                            ? 'bg-emerald-100 ring-2 ring-emerald-500 scale-105 shadow-xs'
                            : 'bg-white hover:bg-zinc-100 border border-zinc-200'
                        }`}
                        title={emoji}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>

                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition cursor-pointer shrink-0 ml-auto text-xs"
                  >
                    <Plus className="w-4 h-4" /> Ekle
                  </button>
                </div>
              </form>

              {/* Kişi Listesi */}
              <div className="grid grid-cols-1 gap-2.5">
                {persons.map(p => (
                  <div
                    key={p.id}
                    className="p-3.5 rounded-xl border border-zinc-200 flex items-center justify-between gap-3 bg-white hover:border-zinc-300 transition"
                  >
                    <div className="flex items-center gap-3.5 flex-1 min-w-0">
                      <button
                        type="button"
                        onClick={() => {
                          const currentIndex = AVATAR_OPTIONS.indexOf(p.avatar);
                          const nextEmoji = AVATAR_OPTIONS[(currentIndex + 1) % AVATAR_OPTIONS.length] || '👩';
                          handleUpdatePerson(p.id, 'avatar', nextEmoji);
                        }}
                        title="İkonu değiştirmek için tıkla"
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 border transition hover:scale-105 active:scale-95 cursor-pointer ${p.color || 'bg-zinc-100 text-zinc-700 border-zinc-200'}`}
                      >
                        {p.avatar}
                      </button>
                      <div className="flex-1 min-w-0 space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-semibold text-zinc-400 w-8 shrink-0">İsim:</span>
                          <input
                            type="text"
                            value={p.name}
                            onChange={e => handleUpdatePerson(p.id, 'name', e.target.value)}
                            className="font-bold text-zinc-900 text-xs flex-1 bg-zinc-50 focus:bg-white px-2 py-1 rounded-md border border-zinc-200 focus:border-emerald-500 outline-none transition"
                            placeholder="Kişi adı girin"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-semibold text-zinc-400 w-8 shrink-0">Rol:</span>
                          <input
                            type="text"
                            value={p.role || ''}
                            onChange={e => handleUpdatePerson(p.id, 'role', e.target.value)}
                            className="text-[11px] text-zinc-600 flex-1 bg-zinc-50 focus:bg-white px-2 py-1 rounded-md border border-zinc-200 focus:border-emerald-500 outline-none transition"
                            placeholder="Rol / tanım girin"
                          />
                        </div>
                      </div>
                    </div>

                    {p.id !== 'ortak' && persons.length > 1 && (
                      <button
                        onClick={() => handleDeletePerson(p.id)}
                        className="text-zinc-300 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                        title="Kişiyi Sil"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
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
