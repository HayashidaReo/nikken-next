/**
 * @jest-environment jsdom
 */

import { renderHook, act } from "@testing-library/react";
import { useFormValidation, ValidationRule } from "./useFormValidation";

interface TestFormData extends Record<string, unknown> {
  name: string;
  email: string;
  age: number;
  description: string;
  phone: string;
}

describe("useFormValidation", () => {
  const initialValues: TestFormData = {
    name: "",
    email: "",
    age: 0,
    description: "",
    phone: "",
  };

  const validationRules: Partial<Record<keyof TestFormData, ValidationRule>> = {
    name: {
      required: true,
      minLength: 2,
      maxLength: 50,
    },
    email: {
      required: true,
      email: true,
    },
    age: {
      required: true,
      number: true,
      custom: value => {
        const numValue = Number(value);
        if (numValue < 0) return "年齢は0以上である必要があります";
        if (numValue > 150) return "年齢は150以下である必要があります";
        return null;
      },
    },
    description: {
      maxLength: 500,
    },
    phone: {
      pattern: /^[0-9-]+$/,
    },
  };

  describe("初期状態", () => {
    it("正しい初期値を持つ", () => {
      const { result } = renderHook(() =>
        useFormValidation(initialValues, validationRules)
      );

      expect(result.current.values).toEqual(initialValues);
      expect(result.current.errors).toEqual({});
      expect(result.current.touched).toEqual({});
      expect(result.current.hasErrors).toBe(false);
      expect(result.current.isValid).toBe(true);
    });
  });

  describe("値の設定", () => {
    it("setValue で値を更新できる", () => {
      const { result } = renderHook(() =>
        useFormValidation(initialValues, validationRules)
      );

      act(() => {
        result.current.setValue("name", "テスト太郎");
      });

      expect(result.current.values.name).toBe("テスト太郎");
    });

    it("setValue でエラーがクリアされる", () => {
      const { result } = renderHook(() =>
        useFormValidation(initialValues, validationRules)
      );

      // 先にバリデーションを実行してエラーを発生させる
      act(() => {
        result.current.validateAll();
      });

      expect(result.current.errors.name).toBeDefined();

      // 値を設定するとエラーがクリアされる
      act(() => {
        result.current.setValue("name", "テスト太郎");
      });

      expect(result.current.errors.name).toBeUndefined();
    });
  });

  describe("フィールドのタッチ状態", () => {
    it("setFieldTouched でタッチ状態を設定できる", () => {
      const { result } = renderHook(() =>
        useFormValidation(initialValues, validationRules)
      );

      act(() => {
        result.current.setFieldTouched("name");
      });

      expect(result.current.touched.name).toBe(true);
    });

    it("フィールドがタッチされるとバリデーションが実行される", () => {
      const { result } = renderHook(() =>
        useFormValidation(initialValues, validationRules)
      );

      act(() => {
        result.current.setFieldTouched("name");
      });

      expect(result.current.errors.name).toEqual({
        message: "この項目は必須です",
        type: "required",
      });
    });

    it("タッチ状態をfalseに設定できる", () => {
      const { result } = renderHook(() =>
        useFormValidation(initialValues, validationRules)
      );

      act(() => {
        result.current.setFieldTouched("name", true);
      });

      expect(result.current.touched.name).toBe(true);

      act(() => {
        result.current.setFieldTouched("name", false);
      });

      expect(result.current.touched.name).toBe(false);
    });
  });

  describe("個別フィールドのバリデーション", () => {
    describe("required バリデーション", () => {
      it("必須フィールドが空の場合はエラーを返す", () => {
        const { result } = renderHook(() =>
          useFormValidation(initialValues, validationRules)
        );

        const error = result.current.validateField("name", "");
        expect(error).toEqual({
          message: "この項目は必須です",
          type: "required",
        });
      });

      it("必須フィールドに値がある場合はエラーを返さない", () => {
        const { result } = renderHook(() =>
          useFormValidation(initialValues, validationRules)
        );

        const error = result.current.validateField("name", "テスト");
        expect(error).toBeNull();
      });

      it("空白文字のみの場合はエラーを返す", () => {
        const { result } = renderHook(() =>
          useFormValidation(initialValues, validationRules)
        );

        const error = result.current.validateField("name", "   ");
        expect(error).toEqual({
          message: "この項目は必須です",
          type: "required",
        });
      });
    });

    describe("minLength バリデーション", () => {
      it("最小長より短い場合はエラーを返す", () => {
        const { result } = renderHook(() =>
          useFormValidation(initialValues, validationRules)
        );

        const error = result.current.validateField("name", "a");
        expect(error).toEqual({
          message: "2文字以上で入力してください",
          type: "minLength",
        });
      });

      it("最小長以上の場合はエラーを返さない", () => {
        const { result } = renderHook(() =>
          useFormValidation(initialValues, validationRules)
        );

        const error = result.current.validateField("name", "ab");
        expect(error).toBeNull();
      });
    });

    describe("maxLength バリデーション", () => {
      it("最大長より長い場合はエラーを返す", () => {
        const { result } = renderHook(() =>
          useFormValidation(initialValues, validationRules)
        );

        const longString = "a".repeat(51);
        const error = result.current.validateField("name", longString);
        expect(error).toEqual({
          message: "50文字以内で入力してください",
          type: "maxLength",
        });
      });

      it("最大長以下の場合はエラーを返さない", () => {
        const { result } = renderHook(() =>
          useFormValidation(initialValues, validationRules)
        );

        const error = result.current.validateField("description", "短い説明");
        expect(error).toBeNull();
      });
    });

    describe("email バリデーション", () => {
      it("無効なメールアドレスの場合はエラーを返す", () => {
        const { result } = renderHook(() =>
          useFormValidation(initialValues, validationRules)
        );

        // 空文字はrequiredエラーになり、emailバリデーションは実行されない
        const emptyError = result.current.validateField("email", "");
        expect(emptyError).toEqual({
          message: "この項目は必須です",
          type: "required",
        });

        // 無効なメール形式のテスト（空文字以外）
        const invalidEmails = [
          "invalid-email",
          "@example.com",
          "test@",
          "test.example.com",
        ];

        invalidEmails.forEach(email => {
          const error = result.current.validateField("email", email);
          expect(error).toEqual({
            message: "有効なメールアドレスを入力してください",
            type: "email",
          });
        });
      });

      it("有効なメールアドレスの場合はエラーを返さない", () => {
        const { result } = renderHook(() =>
          useFormValidation(initialValues, validationRules)
        );

        const validEmails = [
          "test@example.com",
          "user.name@domain.co.jp",
          "test+tag@example.org",
        ];

        validEmails.forEach(email => {
          const error = result.current.validateField("email", email);
          expect(error).toBeNull();
        });
      });
    });

    describe("number バリデーション", () => {
      it("数値でない場合はエラーを返す", () => {
        const { result } = renderHook(() =>
          useFormValidation(initialValues, validationRules)
        );

        const error = result.current.validateField("age", "not-a-number");
        expect(error).toEqual({
          message: "数値を入力してください",
          type: "number",
        });
      });

      it("数値の場合はエラーを返さない", () => {
        const { result } = renderHook(() =>
          useFormValidation(initialValues, validationRules)
        );

        // カスタムバリデーションで0以上150以下の制約があるため、有効な数値を使用
        const validNumbers = ["0", "25", "99.5", "150"];

        validNumbers.forEach(number => {
          const error = result.current.validateField("age", number);
          expect(error).toBeNull();
        });
      });
    });

    describe("pattern バリデーション", () => {
      it("パターンにマッチしない場合はエラーを返す", () => {
        const { result } = renderHook(() =>
          useFormValidation(initialValues, validationRules)
        );

        const error = result.current.validateField("phone", "abc-def");
        expect(error).toEqual({
          message: "入力形式が正しくありません",
          type: "pattern",
        });
      });

      it("パターンにマッチする場合はエラーを返さない", () => {
        const { result } = renderHook(() =>
          useFormValidation(initialValues, validationRules)
        );

        const error = result.current.validateField("phone", "090-1234-5678");
        expect(error).toBeNull();
      });
    });

    describe("custom バリデーション", () => {
      it("カスタムバリデーションでエラーを返す", () => {
        const { result } = renderHook(() =>
          useFormValidation(initialValues, validationRules)
        );

        const error = result.current.validateField("age", "-5");
        expect(error).toEqual({
          message: "年齢は0以上である必要があります",
          type: "custom",
        });

        const error2 = result.current.validateField("age", "200");
        expect(error2).toEqual({
          message: "年齢は150以下である必要があります",
          type: "custom",
        });
      });

      it("カスタムバリデーションが成功する場合", () => {
        const { result } = renderHook(() =>
          useFormValidation(initialValues, validationRules)
        );

        const error = result.current.validateField("age", "25");
        expect(error).toBeNull();
      });
    });

    describe("非必須フィールドの空値処理", () => {
      it("非必須フィールドが空の場合は他のバリデーションをスキップする", () => {
        const { result } = renderHook(() =>
          useFormValidation(initialValues, validationRules)
        );

        // descriptionは非必須で最大長制限があるが、空の場合はエラーにならない
        const error = result.current.validateField("description", "");
        expect(error).toBeNull();
      });

      it("非必須フィールドに値がある場合は他のバリデーションを実行する", () => {
        const { result } = renderHook(() =>
          useFormValidation(initialValues, validationRules)
        );

        const longDescription = "a".repeat(501);
        const error = result.current.validateField(
          "description",
          longDescription
        );
        expect(error).toEqual({
          message: "500文字以内で入力してください",
          type: "maxLength",
        });
      });
    });
  });

  describe("全体バリデーション", () => {
    it("全フィールドが有効な場合は true を返す", () => {
      const validData: TestFormData = {
        name: "テスト太郎",
        email: "test@example.com",
        age: 25,
        description: "テスト説明",
        phone: "090-1234-5678",
      };

      const { result } = renderHook(() =>
        useFormValidation(validData, validationRules)
      );

      let isValid: boolean;
      act(() => {
        isValid = result.current.validateAll();
      });

      expect(isValid!).toBe(true);
      expect(result.current.hasErrors).toBe(false);
    });

    it("無効なフィールドがある場合は false を返す", () => {
      const { result } = renderHook(() =>
        useFormValidation(initialValues, validationRules)
      );

      let isValid: boolean;
      act(() => {
        isValid = result.current.validateAll();
      });

      expect(isValid!).toBe(false);
      expect(result.current.hasErrors).toBe(true);
      expect(result.current.errors.name).toBeDefined();
      expect(result.current.errors.email).toBeDefined();
      expect(result.current.errors.age).toBeDefined();
    });
  });

  describe("ユーティリティ関数", () => {
    it("isFieldValid でフィールドの有効性を確認できる", () => {
      const { result } = renderHook(() =>
        useFormValidation(initialValues, validationRules)
      );

      act(() => {
        result.current.validateAll();
      });

      expect(result.current.isFieldValid("name")).toBe(false);
      expect(result.current.isFieldValid("description")).toBe(true); // 非必須で空なので有効
    });

    it("resetForm でフォームをリセットできる", () => {
      const { result } = renderHook(() =>
        useFormValidation(initialValues, validationRules)
      );

      // 値を設定してエラーを発生させる
      act(() => {
        result.current.setValue("name", "テスト");
        result.current.setFieldTouched("name");
        result.current.validateAll();
      });

      expect(result.current.values.name).toBe("テスト");
      expect(result.current.touched.name).toBe(true);

      // リセット
      act(() => {
        result.current.resetForm();
      });

      expect(result.current.values).toEqual(initialValues);
      expect(result.current.errors).toEqual({});
      expect(result.current.touched).toEqual({});
    });
  });

  describe("バリデーションルールが未定義の場合", () => {
    it("ルールがないフィールドは常に有効", () => {
      const { result } = renderHook(
        () => useFormValidation(initialValues, {}) // ルールなし
      );

      const error = result.current.validateField("name", "");
      expect(error).toBeNull();
    });
  });

  describe("複合的なシナリオ", () => {
    it("フォームの入力から送信までの流れ", () => {
      const { result } = renderHook(() =>
        useFormValidation(initialValues, validationRules)
      );

      // 1. 各フィールドに値を入力
      act(() => {
        result.current.setValue("name", "テスト太郎");
        result.current.setValue("email", "test@example.com");
        result.current.setValue("age", "25");
        result.current.setValue("description", "テストユーザーです");
        result.current.setValue("phone", "090-1234-5678");
      });

      // 2. バリデーションを実行
      let isValid: boolean;
      act(() => {
        isValid = result.current.validateAll();
      });

      // 3. 全て有効である
      expect(isValid!).toBe(true);
      expect(result.current.isValid).toBe(true);
      expect(result.current.hasErrors).toBe(false);
    });

    it("段階的なバリデーション（フィールドごとにタッチ）", () => {
      const { result } = renderHook(() =>
        useFormValidation(initialValues, validationRules)
      );

      // 1. 名前フィールドをタッチ（空のままなのでエラー）
      act(() => {
        result.current.setFieldTouched("name");
      });

      expect(result.current.errors.name).toBeDefined();
      expect(result.current.errors.email).toBeUndefined(); // まだタッチしていない

      // 2. 名前に値を入力（エラー解消）
      act(() => {
        result.current.setValue("name", "テスト太郎");
      });

      expect(result.current.errors.name).toBeUndefined();

      // 3. メールフィールドをタッチ
      act(() => {
        result.current.setFieldTouched("email");
      });

      expect(result.current.errors.email).toBeDefined();
    });
  });
});
