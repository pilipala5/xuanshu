"use client";

import type { FormEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { createRecordId } from "@/features/method-utils";
import { getMethodRecord, saveMethodRecord, type ExtendedMethodId, type MethodHistoryRecord } from "@/features/method-history";

type Options<TInput extends object, TResult> = {
  method: ExtendedMethodId;
  initialInput: TInput;
  calculate: (input: TInput) => TResult;
  title: (result: TResult) => string;
  summary: (result: TResult) => string;
  rulesVersion: string;
  restoreInput?: (stored: TInput) => TInput;
  restoreCalculate?: (input: TInput, record: MethodHistoryRecord) => TResult;
  initializeInput?: () => TInput;
};

export function useMethodWorkbench<TInput extends object, TResult>(options: Options<TInput, TResult>) {
  const [input, setInput] = useState<TInput>(options.initialInput);
  const [result, setResult] = useState<TResult | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const noticeTimer = useRef<number | null>(null);
  const [initialOptions] = useState(options);

  const showNotice = (message: string) => {
    setNotice(message);
    if (noticeTimer.current) window.clearTimeout(noticeTimer.current);
    noticeTimer.current = window.setTimeout(() => setNotice(""), 3200);
  };

  useEffect(() => {
    let frame = 0;
    const recordId = new URLSearchParams(window.location.search).get("record");
    if (recordId) {
      const record = getMethodRecord(recordId);
      if (record?.method === initialOptions.method) {
        try {
          const storedInput = record.input as unknown as TInput;
          const restoredInput = initialOptions.restoreInput?.(storedInput) ?? storedInput;
          const restoredResult = initialOptions.restoreCalculate?.(restoredInput, record) ?? initialOptions.calculate(restoredInput);
          frame = window.requestAnimationFrame(() => { setInput(restoredInput); setResult(restoredResult); });
        } catch {
          frame = window.requestAnimationFrame(() => setError("这条本机记录已经损坏，请重新排盘"));
        }
      } else {
        frame = window.requestAnimationFrame(() => setError("这条本机记录不存在，请重新排盘"));
      }
    } else if (initialOptions.initializeInput) {
      const currentInput = initialOptions.initializeInput();
      frame = window.requestAnimationFrame(() => setInput(currentInput));
    }
    return () => { if (frame) window.cancelAnimationFrame(frame); if (noticeTimer.current) window.clearTimeout(noticeTimer.current); };
  }, [initialOptions]);

  const updateInputs = (values: Partial<TInput>) => {
    if (Object.entries(values).every(([key, value]) => input[key as keyof TInput] === value)) return;
    setInput((current) => ({ ...current, ...values }));
    setResult(null);
    setNotice("");
    if (noticeTimer.current) window.clearTimeout(noticeTimer.current);
    window.history.replaceState(null, "", `/${options.method}`);
    if (error) setError("");
  };
  const updateInput = <K extends keyof TInput>(key: K, value: TInput[K]) => {
    const values: Partial<TInput> = {};
    values[key] = value;
    updateInputs(values);
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const nextResult = options.calculate(input);
      setResult(nextResult);
      setError("");
      const id = createRecordId();
      try {
        saveMethodRecord({
          id,
          method: options.method,
          title: options.title(nextResult),
          summary: options.summary(nextResult),
          createdAt: new Date().toISOString(),
          input: input as unknown as Record<string, string>,
          rulesVersion: options.rulesVersion,
        });
        window.history.replaceState(null, "", `/${options.method}?record=${id}`);
        showNotice("排盘完成，已保存到本机记录");
      } catch {
        showNotice("排盘已完成，但浏览器未允许保存本机记录");
      }
    } catch (reason) {
      setResult(null);
      setError(reason instanceof Error ? reason.message : "排盘失败，请检查输入");
    }
  };

  return { input, result, error, notice, updateInput, updateInputs, submit };
}
