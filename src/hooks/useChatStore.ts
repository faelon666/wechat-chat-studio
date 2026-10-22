"use client";

import { useEffect, useState } from "react";
import { defaultChat } from "../store/defaults";
import type { ChatSettings, ChatState, Message, Person } from "../store/types";

const STORAGE_KEY = "wechat-chat-simulator-v1";
const uid = () => crypto.randomUUID();

function loadChat(): ChatState {
  if (typeof window === "undefined") return defaultChat;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultChat;
    const parsed = JSON.parse(raw) as ChatState;
    if (!Array.isArray(parsed.people) || !Array.isArray(parsed.messages) || !parsed.settings || parsed.people.length === 0) return defaultChat;
    return { ...parsed, settings: { ...defaultChat.settings, ...parsed.settings } };
  } catch {
    return defaultChat;
  }
}

export function useChatStore() {
  const [chat, setChat] = useState<ChatState>(defaultChat);
  const [hydrated, setHydrated] = useState(false);
  const [saveError, setSaveError] = useState(false);

  useEffect(() => {
    setChat(loadChat());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const timer = window.setTimeout(() => {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(chat));
        setSaveError(false);
      } catch {
        setSaveError(true);
      }
    }, 250);
    return () => window.clearTimeout(timer);
  }, [chat, hydrated]);

  const updateSettings = (patch: Partial<ChatSettings>) => setChat((prev) => ({ ...prev, settings: { ...prev.settings, ...patch } }));
  const updatePerson = (id: string, patch: Partial<Person>) => setChat((prev) => ({ ...prev, people: prev.people.map((person) => person.id === id ? { ...person, ...patch } : person) }));
  const addPerson = () => setChat((prev) => {
    const id = uid();
    return { ...prev, people: [...prev.people, { id, name: `人物${prev.people.length + 1}`, avatar: "/avatar-new.svg" }], activeSenderId: id };
  });
  const deletePerson = (id: string) => setChat((prev) => {
    if (prev.people.length <= 1) return prev;
    const people = prev.people.filter((person) => person.id !== id);
    return { ...prev, people, activeSenderId: prev.activeSenderId === id ? people[0].id : prev.activeSenderId, messages: prev.messages.map((message) => message.senderId === id ? { ...message, senderId: people[0].id } : message) };
  });
  const setActiveSenderId = (id: string) => setChat((prev) => ({ ...prev, activeSenderId: id }));
  const addMessage = (message: Omit<Message, "id" | "senderId">) => setChat((prev) => ({ ...prev, messages: [...prev.messages, { ...message, id: uid(), senderId: prev.activeSenderId }] }));
  const updateMessage = (id: string, patch: Partial<Message>) => setChat((prev) => ({ ...prev, messages: prev.messages.map((message) => message.id === id ? { ...message, ...patch } : message) }));
  const deleteMessage = (id: string) => setChat((prev) => ({ ...prev, messages: prev.messages.filter((message) => message.id !== id) }));
  const moveMessage = (fromId: string, toId: string) => setChat((prev) => {
    const messages = [...prev.messages];
    const from = messages.findIndex((message) => message.id === fromId);
    const to = messages.findIndex((message) => message.id === toId);
    if (from < 0 || to < 0 || from === to) return prev;
    messages.splice(to, 0, messages.splice(from, 1)[0]);
    return { ...prev, messages };
  });
  const shiftMessage = (id: string, direction: -1 | 1) => setChat((prev) => {
    const messages = [...prev.messages];
    const index = messages.findIndex((message) => message.id === id);
    const next = index + direction;
    if (index < 0 || next < 0 || next >= messages.length) return prev;
    [messages[index], messages[next]] = [messages[next], messages[index]];
    return { ...prev, messages };
  });
  const clearMessages = () => setChat((prev) => ({ ...prev, messages: [] }));
  const resetChat = () => setChat(defaultChat);

  return { chat, saveError, hydrated, updateSettings, updatePerson, addPerson, deletePerson, setActiveSenderId, addMessage, updateMessage, deleteMessage, moveMessage, shiftMessage, clearMessages, resetChat };
}

export type ChatStore = ReturnType<typeof useChatStore>;
