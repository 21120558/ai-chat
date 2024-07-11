import {defineStore} from 'pinia';
import {ref, watch} from 'vue';
import {db} from '@/db';
import type {Settings} from '@/models/settings.model';

export const useSettingsStore = defineStore('settings', () => {
  const DEFAULT_TEMP = '0.7';
  const DEFAULT_MODEL = 'llama3';
  const DEFAILT_OPENAI_MAX_TOKENS = '2025';

  const areSettingsVisible = ref(false);

  // const apiKey = ref<string>('');
  const temp = ref<string>('');
  const model = ref<string>('');
  const maxTokens = ref<string>('');
  const dbReloadCount = ref(0);

  function showSettings() {
    areSettingsVisible.value = true;
  }

  function hideSettings() {
    areSettingsVisible.value = false;
  }

  async function reloadSettings(i = 1) {
    try {
      const settings = await db.settings.get(1);
      if (!settings) {
        if (i > 1) {
          throw new Error('Endless loop while creating settings DB');
        }
        await db.settings.add({
          // openaiApiKey: '',
          temp: DEFAULT_TEMP,
          model: DEFAULT_MODEL,
          openaiMaxTokens: DEFAILT_OPENAI_MAX_TOKENS
        });
        i++;
        await reloadSettings(i);
      } else {
        // apiKey.value = settings.openaiApiKey;
        temp.value = settings.temp;
        model.value = settings.model;
        maxTokens.value = settings.openaiMaxTokens;
        dbReloadCount.value++;
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function updateSettings(form: Settings) {
    try {
      await db.settings.update(1, {
        // openaiApiKey: form.openaiApiKey,
        temp: form.temp,
        model: form.model,
        openaiMaxTokens: form.openaiMaxTokens
      });
    } catch (e) {
      console.error(e);
    }
  }

  watch(areSettingsVisible, async (newValue, oldValue) => {
    if (oldValue === true && newValue === false) {
      await reloadSettings();
    }
  });

  return {
    areSettingsVisible,
    // apiKey,
    temp,
    model,
    maxTokens,
    dbReloadCount,
    showSettings,
    hideSettings,
    reloadSettings,
    updateSettings
  };
});