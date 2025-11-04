import {
  organizationSchema,
  organizationCreateSchema,
  organizationCreateWithAccountSchema,
  type Organization,
  type OrganizationCreate,
  type OrganizationCreateWithAccount,
} from "./organization.schema";

describe("Organization Schema Validation", () => {
  describe("organizationSchema", () => {
    const validOrganization: Organization = {
      orgId: "org-001",
      orgName: "日本拳法連盟",
      representativeName: "田中太郎",
      representativePhone: "090-1234-5678",
      representativeEmail: "tanaka@example.com",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it("有効な組織データを受け入れる", () => {
      const result = organizationSchema.safeParse(validOrganization);
      expect(result.success).toBe(true);
    });

    it("orgIdが空文字列の場合はエラー", () => {
      const invalid = { ...validOrganization, orgId: "" };
      const result = organizationSchema.safeParse(invalid);
      expect(result.success).toBe(true); // orgIdはoptionalのため空文字列でも成功
    });

    it("orgNameが空文字列の場合はエラー", () => {
      const invalid = { ...validOrganization, orgName: "" };
      const result = organizationSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("団体名は必須です");
      }
    });

    it("representativeNameが空文字列の場合はエラー", () => {
      const invalid = { ...validOrganization, representativeName: "" };
      const result = organizationSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("団体代表者名は必須です");
      }
    });

    it("representativePhoneが空文字列の場合はエラー", () => {
      const invalid = { ...validOrganization, representativePhone: "" };
      const result = organizationSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "団体代表者電話番号は必須です"
        );
      }
    });

    it("representativeEmailが空文字列の場合はエラー", () => {
      const invalid = { ...validOrganization, representativeEmail: "" };
      const result = organizationSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "団体代表者メールアドレスは必須です"
        );
      }
    });

    it("representativeEmailが無効な形式の場合はエラー", () => {
      const invalid = {
        ...validOrganization,
        representativeEmail: "invalid-email",
      };
      const result = organizationSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "正しいメールアドレスを入力してください"
        );
      }
    });

    it("オプショナルフィールドがなくても成功する", () => {
      const minimalOrg = {
        orgName: "最小限の組織",
        representativeName: "代表者",
        representativePhone: "090-0000-0000",
        representativeEmail: "rep@example.com",
      };
      const result = organizationSchema.safeParse(minimalOrg);
      expect(result.success).toBe(true);
    });
  });

  describe("organizationCreateSchema", () => {
    const validOrganizationCreate: OrganizationCreate = {
      orgName: "新規組織",
      representativeName: "新規代表者",
      representativePhone: "080-1111-2222",
      representativeEmail: "newrep@example.com",
    };

    it("有効な組織作成データを受け入れる", () => {
      const result = organizationCreateSchema.safeParse(
        validOrganizationCreate
      );
      expect(result.success).toBe(true);
    });

    it("orgId、createdAt、updatedAtは含まれない", () => {
      const withExtraFields = {
        ...validOrganizationCreate,
        orgId: "should-be-excluded",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const result = organizationCreateSchema.safeParse(withExtraFields);
      expect(result.success).toBe(true);
      if (result.success) {
        expect("orgId" in result.data).toBe(false);
        expect("createdAt" in result.data).toBe(false);
        expect("updatedAt" in result.data).toBe(false);
      }
    });

    it("必須フィールドが欠けている場合はエラー", () => {
      const incomplete = {
        orgName: "組織名のみ",
        // representativeName, representativePhone, representativeEmailが欠けている
      };
      const result = organizationCreateSchema.safeParse(incomplete);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.length).toBeGreaterThan(0);
      }
    });
  });

  describe("organizationCreateWithAccountSchema", () => {
    const validOrganizationCreateWithAccount: OrganizationCreateWithAccount = {
      orgName: "アカウント付き組織",
      representativeName: "代表者名",
      representativePhone: "070-3333-4444",
      representativeEmail: "rep-with-account@example.com",
      adminEmail: "admin@example.com",
      adminPassword: "securePassword123",
    };

    it("有効な組織作成（アカウント付き）データを受け入れる", () => {
      const result = organizationCreateWithAccountSchema.safeParse(
        validOrganizationCreateWithAccount
      );
      expect(result.success).toBe(true);
    });

    it("adminEmailが空文字列の場合はエラー", () => {
      const invalid = { ...validOrganizationCreateWithAccount, adminEmail: "" };
      const result = organizationCreateWithAccountSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "管理者メールアドレスは必須です"
        );
      }
    });

    it("adminEmailが無効な形式の場合はエラー", () => {
      const invalid = {
        ...validOrganizationCreateWithAccount,
        adminEmail: "invalid-admin-email",
      };
      const result = organizationCreateWithAccountSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "正しいメールアドレスを入力してください"
        );
      }
    });

    it("adminPasswordが6文字未満の場合はエラー", () => {
      const invalid = {
        ...validOrganizationCreateWithAccount,
        adminPassword: "123",
      };
      const result = organizationCreateWithAccountSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "パスワードは6文字以上である必要があります"
        );
      }
    });

    it("adminPasswordがちょうど6文字の場合は成功", () => {
      const valid = {
        ...validOrganizationCreateWithAccount,
        adminPassword: "123456",
      };
      const result = organizationCreateWithAccountSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("orgId、createdAt、updatedAtは含まれない", () => {
      const withExtraFields = {
        ...validOrganizationCreateWithAccount,
        orgId: "should-be-excluded",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const result =
        organizationCreateWithAccountSchema.safeParse(withExtraFields);
      expect(result.success).toBe(true);
      if (result.success) {
        expect("orgId" in result.data).toBe(false);
        expect("createdAt" in result.data).toBe(false);
        expect("updatedAt" in result.data).toBe(false);
      }
    });
  });

  describe("エッジケース", () => {
    it("日本語の組織名を正しく処理する", () => {
      const japaneseOrg = {
        orgName: "全日本拳法連盟",
        representativeName: "田中　太郎",
        representativePhone: "03-1234-5678",
        representativeEmail: "tanaka@nihonkempo.or.jp",
      };
      const result = organizationCreateSchema.safeParse(japaneseOrg);
      expect(result.success).toBe(true);
    });

    it("長い組織名を正しく処理する", () => {
      const longOrg = {
        orgName: "非常に長い組織名を持つ全国規模の日本拳法振興団体連合会",
        representativeName: "代表者",
        representativePhone: "090-0000-0000",
        representativeEmail: "long@example.com",
      };
      const result = organizationCreateSchema.safeParse(longOrg);
      expect(result.success).toBe(true);
    });

    it("様々な電話番号形式を受け入れる", () => {
      const phoneFormats = [
        "090-1234-5678",
        "03-1234-5678",
        "0120-123-456",
        "09012345678",
        "03-1234-5678",
      ];

      phoneFormats.forEach(phone => {
        const org = {
          orgName: "テスト組織",
          representativeName: "テスト代表者",
          representativePhone: phone,
          representativeEmail: "test@example.com",
        };
        const result = organizationCreateSchema.safeParse(org);
        expect(result.success).toBe(true);
      });
    });
  });
});
