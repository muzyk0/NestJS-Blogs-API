declare global {
  namespace jest {
    interface Expect {
      toBeTypeOrNull(classTypeOrNull: any): null;
    }
  }
}

export {};
