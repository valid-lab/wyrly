import { assertEquals } from "jsr:@std/assert@1";
import { normalizeLocaleTag, resolveLocale, validationMessage } from "./i18n.ts";

Deno.test("normalizeLocaleTag maps ja variants", () => {
  assertEquals(normalizeLocaleTag("ja"), "ja");
  assertEquals(normalizeLocaleTag("ja-JP"), "ja");
  assertEquals(normalizeLocaleTag("ja_JP.UTF-8"), "ja");
  assertEquals(normalizeLocaleTag("en-US"), "en");
  assertEquals(normalizeLocaleTag("fr"), "en");
});

Deno.test("resolveLocale prefers explicit option", () => {
  const prev = Deno.env.get("WYRLY_LOCALE");
  try {
    Deno.env.set("WYRLY_LOCALE", "ja");
    assertEquals(resolveLocale({ locale: "en" }), "en");
  } finally {
    if (prev === undefined) Deno.env.delete("WYRLY_LOCALE");
    else Deno.env.set("WYRLY_LOCALE", prev);
  }
});

Deno.test("resolveLocale uses WYRLY_LOCALE", () => {
  const prev = Deno.env.get("WYRLY_LOCALE");
  const lang = Deno.env.get("LANG");
  try {
    Deno.env.delete("LANG");
    Deno.env.set("WYRLY_LOCALE", "ja");
    assertEquals(resolveLocale(), "ja");
  } finally {
    if (prev === undefined) Deno.env.delete("WYRLY_LOCALE");
    else Deno.env.set("WYRLY_LOCALE", prev);
    if (lang === undefined) Deno.env.delete("LANG");
    else Deno.env.set("LANG", lang);
  }
});

Deno.test("validationMessage returns Japanese for ja locale", () => {
  const msg = validationMessage("unused_provider", { fromId: "token:X", depId: "" }, "ja");
  assertEquals(msg.includes("未使用"), true);
});

Deno.test("validationMessage returns English for en locale", () => {
  const msg = validationMessage("unused_provider", { fromId: "token:X", depId: "" }, "en");
  assertEquals(msg.includes("unused"), true);
});
