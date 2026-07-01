import React, { useEffect, useCallback, useRef } from 'react';
import { loadOfficeSetting } from '../constants';
import { recordError, recordSuccess, HEALTH_EVENT } from '../systemHealth';

export function useTelegramAlerts(profile: any) {
    const tgRef = useRef({ token: null, chat: null, loaded: false });

    const refreshHealth = useCallback(() => {
        window.dispatchEvent(new Event(HEALTH_EVENT));
    }, []);

    const loadTgConfig = useCallback(async () => {
        if (tgRef.current.loaded) return;
        const [t, c] = await Promise.all([
            loadOfficeSetting('tg_instant_token'),
            loadOfficeSetting('tg_instant_chat'),
        ]);
        tgRef.current = { token: t, chat: c, loaded: true };
    }, []);

    useEffect(() => { if (profile) loadTgConfig(); }, [profile]);

    const sendTelegram = async (text: string) => {
        try {
            if (!tgRef.current.loaded) await loadTgConfig();
            const { token, chat } = tgRef.current;
            if (!token || !chat) return;
            const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chat_id: chat, text, parse_mode: 'HTML' })
            });
            const json = await res.json();
            if (!res.ok || !json.ok) {
                recordError('telegram', json?.description);
                refreshHealth();
            } else {
                recordSuccess('telegram');
                refreshHealth();
            }
        } catch (e: any) {
            console.error('Telegram error', e);
            recordError('telegram', e?.message);
            refreshHealth();
        }
    };

    return { sendTelegram };
}
