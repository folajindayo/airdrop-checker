import {
  ok,
  err,
  isOk,
  isErr,
  unwrap,
  unwrapOr,
  some,
  none,
  isSome,
  isNone,
  unwrapOption,
  unwrapOptionOr,
  idle,
  loading,
  success,
  error,
  isIdle,
  isLoading,
  isSuccess,
  isError,
} from "@/lib/types/discriminated";

describe("Discriminated Union Types", () => {
  describe("Result", () => {
    describe("ok", () => {
      it("creates success result", () => {
        const result = ok("data");
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toBe("data");
        }
      });
    });

    describe("err", () => {
      it("creates error result", () => {
        const result = err(new Error("error"));
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error).toBeInstanceOf(Error);
        }
      });
    });

    describe("isOk", () => {
      it("returns true for success results", () => {
        const result = ok("data");
        expect(isOk(result)).toBe(true);
      });

      it("returns false for error results", () => {
        const result = err(new Error("error"));
        expect(isOk(result)).toBe(false);
      });
    });

    describe("isErr", () => {
      it("returns true for error results", () => {
        const result = err(new Error("error"));
        expect(isErr(result)).toBe(true);
      });

      it("returns false for success results", () => {
        const result = ok("data");
        expect(isErr(result)).toBe(false);
      });
    });

    describe("unwrap", () => {
      it("returns data for success results", () => {
        const result = ok("data");
        expect(unwrap(result)).toBe("data");
      });

      it("throws for error results", () => {
        const result = err(new Error("error"));
        expect(() => unwrap(result)).toThrow();
      });
    });

    describe("unwrapOr", () => {
      it("returns data for success results", () => {
        const result = ok("data");
        expect(unwrapOr(result, "default")).toBe("data");
      });

      it("returns default for error results", () => {
        const result = err(new Error("error"));
        expect(unwrapOr(result, "default")).toBe("default");
      });
    });
  });

  describe("Option", () => {
    describe("some", () => {
      it("creates some option", () => {
        const option = some("value");
        expect(option.type).toBe("some");
        if (option.type === "some") {
          expect(option.value).toBe("value");
        }
      });
    });

    describe("none", () => {
      it("creates none option", () => {
        const option = none();
        expect(option.type).toBe("none");
      });
    });

    describe("isSome", () => {
      it("returns true for some options", () => {
        const option = some("value");
        expect(isSome(option)).toBe(true);
      });

      it("returns false for none options", () => {
        const option = none();
        expect(isSome(option)).toBe(false);
      });
    });

    describe("isNone", () => {
      it("returns true for none options", () => {
        const option = none();
        expect(isNone(option)).toBe(true);
      });

      it("returns false for some options", () => {
        const option = some("value");
        expect(isNone(option)).toBe(false);
      });
    });

    describe("unwrapOption", () => {
      it("returns value for some options", () => {
        const option = some("value");
        expect(unwrapOption(option)).toBe("value");
      });

      it("throws for none options", () => {
        const option = none();
        expect(() => unwrapOption(option)).toThrow();
      });
    });

    describe("unwrapOptionOr", () => {
      it("returns value for some options", () => {
        const option = some("value");
        expect(unwrapOptionOr(option, "default")).toBe("value");
      });

      it("returns default for none options", () => {
        const option = none();
        expect(unwrapOptionOr(option, "default")).toBe("default");
      });
    });
  });

  describe("LoadingState", () => {
    describe("idle", () => {
      it("creates idle state", () => {
        const state = idle();
        expect(state.state).toBe("idle");
      });
    });

    describe("loading", () => {
      it("creates loading state", () => {
        const state = loading();
        expect(state.state).toBe("loading");
      });
    });

    describe("success", () => {
      it("creates success state", () => {
        const state = success("data");
        expect(state.state).toBe("success");
        if (state.state === "success") {
          expect(state.data).toBe("data");
        }
      });
    });

    describe("error", () => {
      it("creates error state", () => {
        const state = error(new Error("error"));
        expect(state.state).toBe("error");
        if (state.state === "error") {
          expect(state.error).toBeInstanceOf(Error);
        }
      });
    });

    describe("isIdle", () => {
      it("returns true for idle state", () => {
        const state = idle();
        expect(isIdle(state)).toBe(true);
      });

      it("returns false for other states", () => {
        expect(isIdle(loading())).toBe(false);
        expect(isIdle(success("data"))).toBe(false);
      });
    });

    describe("isLoading", () => {
      it("returns true for loading state", () => {
        const state = loading();
        expect(isLoading(state)).toBe(true);
      });

      it("returns false for other states", () => {
        expect(isLoading(idle())).toBe(false);
        expect(isLoading(success("data"))).toBe(false);
      });
    });

    describe("isSuccess", () => {
      it("returns true for success state", () => {
        const state = success("data");
        expect(isSuccess(state)).toBe(true);
      });

      it("returns false for other states", () => {
        expect(isSuccess(idle())).toBe(false);
        expect(isSuccess(loading())).toBe(false);
      });
    });

    describe("isError", () => {
      it("returns true for error state", () => {
        const state = error(new Error("error"));
        expect(isError(state)).toBe(true);
      });

      it("returns false for other states", () => {
        expect(isError(idle())).toBe(false);
        expect(isError(loading())).toBe(false);
      });
    });
  });
});

