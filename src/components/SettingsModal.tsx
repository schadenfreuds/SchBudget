'use client';

import React, { useState, useEffect, useRef } from 'react';
import { AppSettings, Person, Category } from '@/types/budget';
import {
  X, Plus, Trash2, Cloud, Check, Wrench,
  Download, Upload, AlertTriangle,
  Tag, Users, Palette, Sun, Moon, Monitor,
  Globe, Coins, CloudOff, RefreshCw
} from 'lucide-react';
import { formatAmountInput, parseFormattedAmount } from '@/lib/formatters';
import { downloadBackupFile, restoreBackupFile, clearAllLocalData } from '@/lib/backup';
import { getStoredTheme, setTheme, ThemeMode } from '@/lib/theme';
import { useI18n } from '@/context/I18nContext';
import { CURRENCIES, CurrencyCode, Language } from '@/lib/i18n';
import { getCurrentFirebaseProject, testFirebaseConnection } from '@/lib/firebase';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSaveSettings: (settings: AppSettings) => void;
  onConnectFirebase: (configStr: string) => Promise<{ success: boolean; error?: string }> | void;
  onDisconnectFirebase?: () => void;
  isCloudConnected: boolean;
  onLoadMockup?: () => void;
  onDataRestored?: () => void;
  onResetAllData?: () => void | Promise<void>;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  onConnectFirebase,
  onDisconnectFirebase,
  isCloudConnected,
  onLoadMockup,
  onDataRestored,
  onResetAllData,
}) => {
  const [activeTab, setActiveTab] = useState<'persons' | 'categories' | 'theme' | 'backup' | 'cloud' | 'devtools'>('persons');
  const [currentTheme, setCurrentTheme] = useState<ThemeMode>('system');
  const { t, lang, setLang, currency, setCurrency, translateCategory, translatePerson, translateRole } = useI18n();

  useEffect(() => {
    if (isOpen) {
      setCurrentTheme(getStoredTheme());
    }
  }, [isOpen]);

  // --- 1. KİŞİLER ---
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

  // --- 2. KATEGORİLER ---
  const [categories, setCategories] = useState<Category[]>(settings.categories || []);
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('✨');

  const CATEGORY_ICONS = ['🛒', '🍎', '🥩', '⚡', '🏢', '💊', '🚗', '☕', '👗', '🛋️', '📚', '🐕', '🎮', '✈️', '💻', '✨'];

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    const newCatId = `cat_${Date.now()}`;
    const newCategory: Category = {
      id: newCatId,
      name: newCatName.trim(),
      icon: newCatIcon || '📦',
      color: 'bg-zinc-100 text-zinc-700',
    };

    const updated = [...categories, newCategory];
    setCategories(updated);
    onSaveSettings({ ...settings, categories: updated });
    setNewCatName('');
  };

  const handleDeleteCategory = (catId: string) => {
    if (categories.length <= 3) return;
    const updated = categories.filter(c => c.id !== catId);
    setCategories(updated);
    onSaveSettings({ ...settings, categories: updated });
  };

  // --- 4. YEDEKLEME & GERİ YÜKLEME (JSON) ---
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [restoreStatus, setRestoreStatus] = useState<string | null>(null);

  const handleDownloadBackup = () => {
    downloadBackupFile();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (!content) return;

      const res = restoreBackupFile(content);
      if (res.success) {
        setRestoreStatus(t('settings.backup.restoreSuccess').replace('{count}', String(res.count || 0)));
        if (onDataRestored) onDataRestored();
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        setRestoreStatus(`❌ ${res.error || 'Failed to restore'}`);
      }
    };
    reader.readAsText(file);
  };

  const handleResetData = async () => {
    const confirmText = lang === 'en'
      ? 'WARNING: All past months, incomes, expenses, and settings stored in this browser will be permanently cleared.\n\nAre you sure you want to reset all data?'
      : 'DİKKAT: Tarayıcınızdaki tüm geçmiş aylar, gelirler, harcamalar ve ayarlar kalıcı olarak silinecek ve tertemiz bir sayfa açılacaktır.\n\nSıfırlamak istediğinize emin misiniz?';

    if (window.confirm(confirmText)) {
      if (onResetAllData) {
        await onResetAllData();
      } else {
        clearAllLocalData();
        window.location.reload();
      }
    }
  };

  // --- 5. FIREBASE ---
  const [firebaseInput, setFirebaseInput] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [cloudSuccessMsg, setCloudSuccessMsg] = useState(false);
  const [cloudErrorMsg, setCloudErrorMsg] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const activeProject = isCloudConnected ? getCurrentFirebaseProject() : null;

  const handleSaveFirebase = async () => {
    if (!firebaseInput.trim() || isConnecting) return;
    setIsConnecting(true);
    setCloudErrorMsg(null);
    setCloudSuccessMsg(false);
    setTestResult(null);

    try {
      const res = await onConnectFirebase(firebaseInput.trim());
      if (res && !res.success) {
        setCloudErrorMsg(res.error || 'Bağlantı kurulamadı.');
      } else {
        setCloudSuccessMsg(true);
        setFirebaseInput('');
        setTimeout(() => setCloudSuccessMsg(false), 3500);
      }
    } catch (err) {
      setCloudErrorMsg(String(err));
    } finally {
      setIsConnecting(false);
    }
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await testFirebaseConnection();
      if (res.success) {
        setTestResult({
          success: true,
          message: lang === 'en' ? 'Firestore connection healthy! Live read/write test passed. ✅' : 'Firestore bağlantısı sağlıklı! Canlı okuma/yazma testi başarılı. ✅',
        });
      } else {
        setTestResult({ success: false, message: res.error || (lang === 'en' ? 'Error testing Firestore.' : 'Firestore testinde hata alındı.') });
      }
    } catch (err) {
      setTestResult({ success: false, message: String(err) });
    } finally {
      setIsTesting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl max-w-2xl w-full shadow-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Üst Bar */}
        <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-800/50">
          <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">{t('settings.title')}</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sekmeler - Windows Chrome'da yatay scrollbar çıkmaması için no-scrollbar eklendi */}
        <div className="flex border-b border-zinc-200 dark:border-zinc-800 px-5 pt-2 gap-2 text-xs font-semibold overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('persons')}
            className={`pb-2.5 transition border-b-2 cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'persons'
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                : 'border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>{t('settings.tabs.persons')}</span>
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`pb-2.5 transition border-b-2 cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'categories'
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                : 'border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>{t('settings.tabs.categories')}</span>
          </button>

          <button
            onClick={() => setActiveTab('theme')}
            className={`pb-2.5 transition border-b-2 cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'theme'
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                : 'border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>{t('settings.tabs.theme')}</span>
          </button>

          <button
            onClick={() => setActiveTab('backup')}
            className={`pb-2.5 transition border-b-2 cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'backup'
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                : 'border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>{t('settings.tabs.backup')}</span>
          </button>

          <button
            onClick={() => setActiveTab('cloud')}
            className={`pb-2.5 transition border-b-2 cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'cloud'
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                : 'border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            <Cloud className="w-3.5 h-3.5" />
            <span>{t('settings.tabs.cloud')}</span>
          </button>

          <button
            onClick={() => setActiveTab('devtools')}
            className={`pb-2.5 transition border-b-2 cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'devtools'
                ? 'border-amber-600 text-amber-700 dark:text-amber-400 font-bold'
                : 'border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>{t('settings.tabs.devtools')}</span>
          </button>
        </div>

        {/* Gövde */}
        <div className="p-5 overflow-y-auto space-y-6 flex-1 text-xs">
          
          {/* 1. KİŞİLER SEKME */}
          {activeTab === 'persons' && (
            <div className="space-y-4">
              <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 p-3 rounded-xl text-emerald-800 dark:text-emerald-300">
                <p className="font-semibold">{t('settings.persons.bannerTitle')}</p>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-0.5">
                  {t('settings.persons.bannerDesc')}
                </p>
              </div>

              {/* Kişi Listesi */}
              <div className="space-y-2">
                <label className="font-bold text-zinc-800 dark:text-zinc-200 block text-xs">{t('settings.persons.currentPersons')}</label>
                <div className="divide-y divide-zinc-100 dark:divide-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-white dark:bg-zinc-800/80">
                  {persons.map(p => (
                    <div key={p.id} className="p-3 flex items-center justify-between gap-3 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition">
                      <div className="flex items-center gap-3">
                        <span className="text-xl w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-700 flex items-center justify-center">
                          {p.avatar}
                        </span>
                        <div>
                          <div className="font-bold text-zinc-900 dark:text-zinc-100 text-sm flex items-center gap-2">
                            <span>{translatePerson(p)}</span>
                            {p.role && (
                              <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300">
                                {translateRole(p.role)}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-zinc-400 dark:text-zinc-500">ID: {p.id}</span>
                        </div>
                      </div>

                      {p.id !== 'ortak' && persons.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleDeletePerson(p.id)}
                          className="text-zinc-300 dark:text-zinc-600 hover:text-rose-600 dark:hover:text-rose-400 p-1.5 rounded-lg transition cursor-pointer"
                          title={t('settings.persons.deleteTooltip')}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Yeni Kişi Ekleme */}
              <form onSubmit={handleAddPerson} className="bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-800 p-4 rounded-xl space-y-3">
                <div className="font-bold text-zinc-800 dark:text-zinc-200 text-xs flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>{t('settings.persons.addNew')}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">{t('settings.persons.nameLabel')}</label>
                    <input
                      type="text"
                      required
                      placeholder={t('settings.persons.namePlaceholder')}
                      value={newPersonName}
                      onChange={e => setNewPersonName(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">{t('settings.persons.roleLabel')}</label>
                    <input
                      type="text"
                      placeholder={t('settings.persons.rolePlaceholder')}
                      value={newPersonRole}
                      onChange={e => setNewPersonRole(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">{t('settings.persons.avatarSelect')}</label>
                  <div className="flex gap-2">
                    {AVATAR_OPTIONS.map(emoji => (
                      <button
                        type="button"
                        key={emoji}
                        onClick={() => setNewPersonAvatar(emoji)}
                        className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center border transition cursor-pointer ${
                          newPersonAvatar === emoji ? 'border-emerald-600 bg-white dark:bg-zinc-900 ring-2 ring-emerald-500/20 shadow-xs' : 'border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 hover:bg-white dark:hover:bg-zinc-700'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-1 flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition cursor-pointer shadow-xs"
                  >
                    {t('settings.persons.addBtn')}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* 2. KATEGORİLER SEKME */}
          {activeTab === 'categories' && (
            <div className="space-y-4">
              <div className="bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-900/40 p-3 rounded-xl text-sky-900 dark:text-sky-300">
                <p className="font-semibold">{t('settings.categories.bannerTitle')}</p>
                <p className="text-[11px] text-sky-800 dark:text-sky-400 mt-0.5">
                  {t('settings.categories.bannerDesc')}
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-56 overflow-y-auto p-1">
                {categories.map(cat => (
                  <div key={cat.id} className="p-2 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-800/80 flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-base">{cat.icon}</span>
                      <span className="font-semibold text-zinc-800 dark:text-zinc-200 truncate text-[11px]">{translateCategory(cat)}</span>
                    </div>
                    {categories.length > 3 && (
                      <button
                        type="button"
                        onClick={() => handleDeleteCategory(cat.id)}
                        className="text-zinc-300 dark:text-zinc-600 hover:text-rose-600 dark:hover:text-rose-400 p-1 transition cursor-pointer shrink-0"
                        title={t('settings.categories.deleteTooltip')}
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Yeni Kategori Ekle */}
              <form onSubmit={handleAddCategory} className="bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-800 p-3.5 rounded-xl space-y-3">
                <div className="font-bold text-zinc-800 dark:text-zinc-200 text-xs flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>{t('settings.categories.addNew')}</span>
                </div>

                <div className="flex gap-2">
                  <div className="flex-1">
                    <input
                      type="text"
                      required
                      placeholder={t('settings.categories.namePlaceholder')}
                      value={newCatName}
                      onChange={e => setNewCatName(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
                    />
                  </div>

                  <select
                    value={newCatIcon}
                    onChange={e => setNewCatIcon(e.target.value)}
                    className="px-2 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-sm text-zinc-900 dark:text-zinc-100"
                  >
                    {CATEGORY_ICONS.map(i => (
                      <option key={i} value={i}>{i}</option>
                    ))}
                  </select>

                  <button
                    type="submit"
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition cursor-pointer shrink-0"
                  >
                    {t('settings.categories.addBtn')}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* 3. GÖRÜNÜM / TEMA SEKME */}
          {activeTab === 'theme' && (
            <div className="space-y-6">
              {/* Tema Seçimi */}
              <div className="space-y-3">
                <div>
                  <div className="font-bold text-zinc-900 dark:text-zinc-100 text-xs flex items-center gap-1.5">
                    <Palette className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>{t('settings.appearance.themeTitle')}</span>
                  </div>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                    {t('settings.appearance.themeDesc')}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setTheme('light');
                      setCurrentTheme('light');
                    }}
                    className={`p-3.5 rounded-xl border flex flex-col items-center gap-2 transition cursor-pointer ${
                      currentTheme === 'light'
                        ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 ring-2 ring-emerald-400 text-zinc-900 dark:text-zinc-100 font-bold'
                        : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800/80 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                      <Sun className="w-4 h-4" />
                    </div>
                    <div className="text-center">
                      <div className="text-xs font-bold">{t('settings.appearance.light')}</div>
                      <div className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5">{t('settings.appearance.lightDesc')}</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setTheme('dark');
                      setCurrentTheme('dark');
                    }}
                    className={`p-3.5 rounded-xl border flex flex-col items-center gap-2 transition cursor-pointer ${
                      currentTheme === 'dark'
                        ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 ring-2 ring-emerald-400 text-zinc-900 dark:text-zinc-100 font-bold'
                        : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800/80 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                      <Moon className="w-4 h-4" />
                    </div>
                    <div className="text-center">
                      <div className="text-xs font-bold">{t('settings.appearance.dark')}</div>
                      <div className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5">{t('settings.appearance.darkDesc')}</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setTheme('system');
                      setCurrentTheme('system');
                    }}
                    className={`p-3.5 rounded-xl border flex flex-col items-center gap-2 transition cursor-pointer ${
                      currentTheme === 'system'
                        ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 ring-2 ring-emerald-400 text-zinc-900 dark:text-zinc-100 font-bold'
                        : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800/80 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 flex items-center justify-center">
                      <Monitor className="w-4 h-4" />
                    </div>
                    <div className="text-center">
                      <div className="text-xs font-bold">{t('settings.appearance.system')}</div>
                      <div className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5">{t('settings.appearance.systemDesc')}</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Dil Seçimi (Language) */}
              <div className="space-y-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                <div>
                  <div className="font-bold text-zinc-900 dark:text-zinc-100 text-xs flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span>{t('settings.appearance.languageTitle')}</span>
                  </div>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                    {t('settings.appearance.languageDesc')}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setLang('tr')}
                    className={`p-3 rounded-xl border flex items-center gap-3 transition cursor-pointer ${
                      lang === 'tr'
                        ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 ring-2 ring-emerald-400 text-zinc-900 dark:text-zinc-100 font-bold'
                        : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800/80 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    <div className="text-2xl">🇹🇷</div>
                    <div className="text-left">
                      <div className="text-xs font-bold">{t('settings.appearance.langTr')}</div>
                      <div className="text-[10px] text-zinc-400 dark:text-zinc-500">{t('settings.appearance.langTrDesc')}</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLang('en')}
                    className={`p-3 rounded-xl border flex items-center gap-3 transition cursor-pointer ${
                      lang === 'en'
                        ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 ring-2 ring-emerald-400 text-zinc-900 dark:text-zinc-100 font-bold'
                        : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800/80 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    <div className="text-2xl">🇬🇧</div>
                    <div className="text-left">
                      <div className="text-xs font-bold">{t('settings.appearance.langEn')}</div>
                      <div className="text-[10px] text-zinc-400 dark:text-zinc-500">{t('settings.appearance.langEnDesc')}</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Para Birimi (Currency) */}
              <div className="space-y-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                <div>
                  <div className="font-bold text-zinc-900 dark:text-zinc-100 text-xs flex items-center gap-1.5">
                    <Coins className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <span>{t('settings.appearance.currencyTitle')}</span>
                  </div>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                    {t('settings.appearance.currencyDesc')}
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {(Object.keys(CURRENCIES) as CurrencyCode[]).map((cCode) => {
                    const c = CURRENCIES[cCode];
                    const isSelected = currency === cCode;
                    return (
                      <button
                        key={cCode}
                        type="button"
                        onClick={() => setCurrency(cCode)}
                        className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition cursor-pointer ${
                          isSelected
                            ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 ring-2 ring-emerald-400 text-zinc-900 dark:text-zinc-100 font-bold'
                            : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800/80 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                        }`}
                      >
                        <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 flex items-center justify-center font-bold text-sm">
                          {c.symbol}
                        </div>
                        <div className="text-[11px] font-bold mt-0.5">{cCode}</div>
                        <div className="text-[9px] text-zinc-400 dark:text-zinc-500">{lang === 'en' ? c.enName : c.name}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* 4. YEDEKLEME & GERİ YÜKLEME SEKME */}
          {activeTab === 'backup' && (
            <div className="space-y-4">
              <div className="bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-800 p-3.5 rounded-xl space-y-1">
                <div className="font-bold text-zinc-900 dark:text-zinc-100 text-xs flex items-center gap-1.5">
                  <Download className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>{t('settings.backup.bannerTitle')}</span>
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  {t('settings.backup.bannerDesc')}
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleDownloadBackup}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition cursor-pointer shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{t('settings.backup.downloadBtn')}</span>
                  </button>
                </div>
              </div>

              <div className="bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-800 p-3.5 rounded-xl space-y-2">
                <div className="font-bold text-zinc-900 dark:text-zinc-100 text-xs flex items-center gap-1.5">
                  <Upload className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>{t('settings.backup.restoreTitle')}</span>
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  {t('settings.backup.restoreDesc')}
                </p>

                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".json"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition cursor-pointer shadow-xs"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{t('settings.backup.restoreBtn')}</span>
                  </button>
                </div>

                {restoreStatus && (
                  <div className="mt-2 p-2.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-medium text-[11px]">
                    {restoreStatus}
                  </div>
                )}
              </div>

              <div className="bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 p-3.5 rounded-xl space-y-1">
                <div className="font-bold text-rose-800 dark:text-rose-300 text-xs flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                  <span>{t('settings.backup.resetTitle')}</span>
                </div>
                <p className="text-[11px] text-rose-700 dark:text-rose-400">
                  {t('settings.backup.resetDesc')}
                </p>
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={handleResetData}
                    className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold transition cursor-pointer"
                  >
                    {t('settings.backup.resetBtn')}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 5. BULUT (FIREBASE) SEKME */}
          {activeTab === 'cloud' && (
            <div className="space-y-4">
              <div className={`p-3.5 rounded-xl border ${
                isCloudConnected
                  ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-300'
                  : 'bg-zinc-50 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-xs">
                    {isCloudConnected ? <Cloud className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <CloudOff className="w-4 h-4 text-zinc-400" />}
                    <span>{t('settings.cloud.statusLabel')} {isCloudConnected ? t('settings.cloud.statusConnected') : t('settings.cloud.statusLocal')}</span>
                  </div>
                  {activeProject && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200">
                      {activeProject}
                    </span>
                  )}
                </div>
                <p className="text-[11px] mt-1 text-zinc-600 dark:text-zinc-400">
                  {isCloudConnected 
                    ? (lang === 'en' ? 'Live synchronization is active. All expenses, bills and budgets are synced across your devices via Firestore.' : 'Canlı senkronizasyon aktif. Tüm harcama, fatura ve bütçeleriniz Firestore üzerinden cihazlarınız arasında eşzamanlanır.')
                    : t('settings.cloud.desc')}
                </p>

                {isCloudConnected && (
                  <div className="flex items-center gap-2 pt-2.5 mt-2 border-t border-emerald-200 dark:border-emerald-900/50">
                    <button
                      type="button"
                      onClick={handleTestConnection}
                      disabled={isTesting}
                      className="px-2.5 py-1 text-xs font-semibold rounded bg-emerald-600 hover:bg-emerald-700 text-white transition cursor-pointer flex items-center gap-1.5"
                    >
                      <RefreshCw className={`w-3 h-3 ${isTesting ? 'animate-spin' : ''}`} />
                      <span>{isTesting ? (lang === 'en' ? 'Testing...' : 'Test Ediliyor...') : (lang === 'en' ? 'Test Connection' : 'Bağlantıyı Test Et')}</span>
                    </button>
                    {onDisconnectFirebase && (
                      <button
                        type="button"
                        onClick={onDisconnectFirebase}
                        className="px-2.5 py-1 text-xs font-semibold rounded bg-zinc-200 dark:bg-zinc-700 hover:bg-rose-100 hover:text-rose-700 dark:hover:bg-rose-950/50 dark:hover:text-rose-300 text-zinc-700 dark:text-zinc-300 transition cursor-pointer"
                      >
                        {lang === 'en' ? 'Disconnect Cloud' : 'Bağlantıyı Kes (Yerel Mod)'}
                      </button>
                    )}
                  </div>
                )}
              </div>

              {testResult && (
                <div className={`p-2.5 rounded-xl border text-xs font-medium ${
                  testResult.success 
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
                    : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200'
                }`}>
                  {testResult.message}
                </div>
              )}

              {/* Yeni Yapılandırma Ekle veya Güncelle */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    {isCloudConnected ? (lang === 'en' ? 'Update Firebase Configuration' : 'Yapılandırmayı Güncelle') : t('settings.cloud.jsonLabel')}
                  </label>
                  <span className="text-[10px] text-zinc-400 dark:text-zinc-500">
                    {lang === 'en' ? 'JSON, JS snippet or .env accepted' : 'JSON, JS kodu veya .env formatı'}
                  </span>
                </div>

                <textarea
                  rows={5}
                  placeholder={`{\n  "apiKey": "AIzaSy...",\n  "projectId": "proje-id",\n  "authDomain": "proje.firebaseapp.com",\n  ...\n}`}
                  value={firebaseInput}
                  onChange={e => setFirebaseInput(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono border border-zinc-300 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
                />

                {cloudErrorMsg && (
                  <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs">
                    {cloudErrorMsg}
                  </div>
                )}

                <div className="flex items-center justify-between pt-1">
                  {cloudSuccessMsg ? (
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <Check className="w-4 h-4" /> {t('settings.cloud.saveSuccess')}
                    </span>
                  ) : <span />}

                  <button
                    type="button"
                    onClick={handleSaveFirebase}
                    disabled={isConnecting || !firebaseInput.trim()}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-lg transition cursor-pointer shadow-xs flex items-center gap-1.5"
                  >
                    {isConnecting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                    <span>{isConnecting ? (lang === 'en' ? 'Connecting...' : 'Bağlanıyor...') : t('settings.cloud.saveBtn')}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 6. DEVTOOLS SEKME */}
          {activeTab === 'devtools' && (
            <div className="space-y-4">
              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 p-3.5 rounded-xl text-amber-900 dark:text-amber-300 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-xs">
                  <Wrench className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                  <span>{t('settings.devtools.bannerTitle')}</span>
                </div>
                <p className="text-[11px] text-amber-800 dark:text-amber-400">
                  {t('settings.devtools.bannerDesc')}
                </p>
              </div>

              {onLoadMockup && (
                <div className="p-3 bg-white dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-800 rounded-xl flex items-center justify-between">
                  <div>
                    <div className="font-bold text-zinc-900 dark:text-zinc-100">{t('settings.devtools.mockupTitle')}</div>
                    <div className="text-[11px] text-zinc-500 dark:text-zinc-400">{t('settings.devtools.mockupDesc')}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onLoadMockup();
                      onClose();
                    }}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg transition cursor-pointer shadow-xs"
                  >
                    {t('settings.devtools.mockupBtn')}
                  </button>
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
