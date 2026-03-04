import React, { useState, useEffect } from "react";

const LoaderElement = () => {
  const [isLoading, setIsLoading] = useState(Loader.isLoading);

  useEffect(() => {
    const handleLoadingChange = () => {
      setIsLoading(Loader.isLoading);
    };

    Loader.subscribe(handleLoadingChange);
    return () => {
      Loader.unsubscribe(handleLoadingChange);
    };
  }, []);

  return (
    <div>
      {isLoading && (
        <div className="loader-element">
          <div className="loader"></div>
        </div>
      )}
    </div>
  );
};

class Loader {
  static isLoading: boolean = false;
  static listeners = new Set<() => void>();

  public static subscribe(listener: () => void) {
    Loader.listeners.add(listener);
  }

  public static unsubscribe(listener: () => void) {
    Loader.listeners.delete(listener);
  }

  public startLoading() {
    Loader.isLoading = true;
    Loader.notifyListeners();
  }

  public stopLoading() {
    Loader.isLoading = false;
    Loader.notifyListeners();
  }

  private static notifyListeners() {
    Loader.listeners.forEach((listener) => listener());
  }
}

const loader = new Loader();
export { loader, LoaderElement };
