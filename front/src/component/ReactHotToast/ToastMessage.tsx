import toast from "react-hot-toast";

// durationをInfinityにする場合がある、デフォルトは5秒
export const ErrorToast = (
  message: string | Array<string>,
  duration = 5000
) => {
  const messageString = Array.isArray(message) ? message.join("\n") : message;
  toast.error(
    (t) => (
      <div className="modalSCT">
        {messageString}
        <div onClick={() => toast.dismiss(t.id)} className="close"></div>
      </div>
    ),
    {
      duration: duration,
    }
  );
};

export const SuccessToast = (message: string | Array<string>) => {
  const messageString = Array.isArray(message) ? message.join("\n") : message;
  toast.success((t) => (
    <div className="modalSCT">
      {messageString}
      <div onClick={() => toast.dismiss(t.id)} className="close"></div>
    </div>
  ));
};
