"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button, Card, CardBody, CardHeader, Chip, Input, Select, SelectItem, Spacer, Tabs, Tab } from "@nextui-org/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Title from "@/components/titles";
import { apiRoutes } from "@/core/api/apiRoutes";
import { getData, postData } from "@/core/api/apiHandler";
import { showToastMessage } from "@/utils/utils";

type TemplateType = "signup_otp" | "signin_otp" | "forgot_password_otp" | "verification_otp";

type TemplateRecord = {
  templateType: TemplateType;
  subject: string;
  html: string;
  text: string;
  status: "draft" | "published";
  version: number;
  updatedAt: string;
};

type TemplateSet = Record<TemplateType, { published: TemplateRecord; draft: TemplateRecord | null }>;

const templateOptions: Array<{ value: TemplateType; label: string }> = [
  { value: "signup_otp", label: "Signup OTP" },
  { value: "signin_otp", label: "Sign-in OTP" },
  { value: "forgot_password_otp", label: "Forgot Password OTP" },
  { value: "verification_otp", label: "Generic Verification OTP" },
];

const variableChips = ["{{code}}", "{{roleLabel}}", "{{expiresIn}}", "{{supportEmail}}", "{{appName}}"];

const sampleVars: Record<string, string> = {
  code: "759046",
  roleLabel: "Operator",
  expiresIn: "3 minutes",
  supportEmail: "info@support.obaol.com",
  appName: "OBAOL",
};

const renderVars = (input: string) =>
  String(input || "").replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_m, key) => sampleVars[String(key)] || "");

export default function EmailTemplatesPage() {
  const queryClient = useQueryClient();
  const htmlEditorRef = useRef<HTMLDivElement | null>(null);
  const [selectedType, setSelectedType] = useState<TemplateType>("signup_otp");
  const [testEmail, setTestEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [textBody, setTextBody] = useState("");
  const [htmlBody, setHtmlBody] = useState("");

  const templateQuery = useQuery({
    queryKey: ["system-config-email-templates"],
    queryFn: async () => {
      const res = await getData(apiRoutes.systemConfig.emailTemplates);
      return (res?.data?.data || {}) as TemplateSet;
    },
  });

  const current = useMemo(() => {
    const data = templateQuery.data;
    if (!data) return null;
    const entry = data[selectedType];
    return entry?.draft || entry?.published || null;
  }, [templateQuery.data, selectedType]);

  useEffect(() => {
    if (!current) return;
    setSubject(String(current.subject || ""));
    setTextBody(String(current.text || ""));
    setHtmlBody(String(current.html || ""));
  }, [current?.templateType, current?.version, current?.updatedAt]);

  useEffect(() => {
    if (htmlEditorRef.current && htmlEditorRef.current.innerHTML !== htmlBody) {
      htmlEditorRef.current.innerHTML = htmlBody || "";
    }
  }, [htmlBody]);

  const saveDraftMutation = useMutation({
    mutationFn: async () =>
      postData(apiRoutes.systemConfig.emailTemplatesDraft, {
        templateType: selectedType,
        subject,
        text: textBody,
        html: htmlBody,
      }),
    onSuccess: () => {
      showToastMessage({ type: "success", message: "Draft saved.", position: "top-right" });
      queryClient.invalidateQueries({ queryKey: ["system-config-email-templates"] });
    },
    onError: (error: any) => {
      showToastMessage({ type: "error", message: error?.response?.data?.message || error?.message || "Failed to save draft.", position: "top-right" });
    },
  });

  const publishMutation = useMutation({
    mutationFn: async () =>
      postData(apiRoutes.systemConfig.emailTemplatesPublish, { templateType: selectedType }),
    onSuccess: () => {
      showToastMessage({ type: "success", message: "Template published.", position: "top-right" });
      queryClient.invalidateQueries({ queryKey: ["system-config-email-templates"] });
    },
    onError: (error: any) => {
      showToastMessage({ type: "error", message: error?.response?.data?.message || error?.message || "Failed to publish template.", position: "top-right" });
    },
  });

  const testMutation = useMutation({
    mutationFn: async () =>
      postData(apiRoutes.systemConfig.emailTemplatesTest, {
        templateType: selectedType,
        toEmail: testEmail,
        subject,
        text: textBody,
        html: htmlBody,
      }),
    onSuccess: () => {
      showToastMessage({ type: "success", message: "Test email sent.", position: "top-right" });
    },
    onError: (error: any) => {
      showToastMessage({ type: "error", message: error?.response?.data?.message || error?.message || "Failed to send test email.", position: "top-right" });
    },
  });

  const exec = (command: string) => {
    if (!htmlEditorRef.current) return;
    htmlEditorRef.current.focus();
    document.execCommand(command, false);
    setHtmlBody(htmlEditorRef.current.innerHTML);
  };

  const insertToken = (token: string) => {
    setSubject((prev) => `${prev}${token}`);
  };

  const previewSubject = renderVars(subject);
  const previewText = renderVars(textBody);
  const previewHtml = renderVars(htmlBody);

  return (
    <section>
      <Title title="Email Templates" />
      <div className="mx-2 md:mx-6 mb-6">
        <Card className="mb-5 border border-default-200/60 bg-content1/95">
          <CardHeader className="flex items-center justify-between">
            <div className="font-semibold">Auth Template Editor (Draft/Publish)</div>
            <Select
              size="sm"
              className="max-w-xs"
              selectedKeys={[selectedType]}
              onSelectionChange={(keys) => {
                const key = Array.from(keys)[0] as TemplateType;
                if (key) setSelectedType(key);
              }}
            >
              {templateOptions.map((item) => (
                <SelectItem key={item.value}>{item.label}</SelectItem>
              ))}
            </Select>
          </CardHeader>
          <CardBody>
            <div className="flex flex-wrap gap-2 mb-3">
              {variableChips.map((token) => (
                <Chip key={token} size="sm" variant="flat" onClick={() => insertToken(token)} className="cursor-pointer">
                  {token}
                </Chip>
              ))}
            </div>
            <Input label="Subject" value={subject} onValueChange={setSubject} />
            <Spacer y={3} />
            <Tabs aria-label="editor-tabs">
              <Tab key="text" title="Text Body">
                <textarea
                  className="w-full min-h-[180px] rounded-xl border border-default-300 bg-content2 p-3 text-sm"
                  value={textBody}
                  onChange={(e) => setTextBody(e.target.value)}
                />
              </Tab>
              <Tab key="html" title="Rich HTML Body">
                <div className="mb-2 flex gap-2">
                  <Button size="sm" variant="flat" onPress={() => exec("bold")}>Bold</Button>
                  <Button size="sm" variant="flat" onPress={() => exec("italic")}>Italic</Button>
                  <Button size="sm" variant="flat" onPress={() => exec("underline")}>Underline</Button>
                  <Button size="sm" variant="flat" onPress={() => exec("insertUnorderedList")}>Bullet</Button>
                </div>
                <div
                  ref={htmlEditorRef}
                  contentEditable
                  className="min-h-[220px] rounded-xl border border-default-300 bg-content2 p-3 text-sm outline-none"
                  onInput={() => setHtmlBody(htmlEditorRef.current?.innerHTML || "")}
                />
              </Tab>
            </Tabs>

            <div className="mt-4 flex flex-wrap gap-3">
              <Button color="warning" onPress={() => saveDraftMutation.mutate()} isLoading={saveDraftMutation.isPending}>
                Save Draft
              </Button>
              <Button color="primary" onPress={() => publishMutation.mutate()} isLoading={publishMutation.isPending}>
                Publish
              </Button>
              <Input
                label="Send Test To"
                className="max-w-sm"
                value={testEmail}
                onValueChange={setTestEmail}
                placeholder="name@domain.com"
              />
              <Button color="secondary" onPress={() => testMutation.mutate()} isLoading={testMutation.isPending}>
                Send Test
              </Button>
            </div>
          </CardBody>
        </Card>

        <Card className="border border-default-200/60 bg-content1/95">
          <CardHeader className="font-semibold">Live Preview</CardHeader>
          <CardBody>
            <div className="rounded-xl border border-default-300 bg-content2 p-4">
              <div className="text-xs uppercase tracking-wider text-default-500 mb-1">Subject</div>
              <div className="font-semibold mb-3">{previewSubject}</div>
              <div className="text-xs uppercase tracking-wider text-default-500 mb-1">Text</div>
              <pre className="whitespace-pre-wrap text-sm mb-3">{previewText}</pre>
              <div className="text-xs uppercase tracking-wider text-default-500 mb-1">HTML</div>
              <div className="rounded-lg border border-default-300 bg-white p-3 text-black" dangerouslySetInnerHTML={{ __html: previewHtml }} />
            </div>
          </CardBody>
        </Card>
      </div>
    </section>
  );
}
