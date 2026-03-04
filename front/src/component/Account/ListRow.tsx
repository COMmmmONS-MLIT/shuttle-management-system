import { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { User } from "@/types/user";
import PasswordResetModal from "./PasswordResetModal";

type Props = {
  account: User;
  index: number;
  officeId: string;
  switchMode: (index: number, value: boolean) => void;
  onPasswordResetSuccess?: () => void;
};

const ListRow = ({
  account,
  index,
  officeId,
  switchMode,
  onPasswordResetSuccess,
}: Props) => {
  const [isPasswordResetModalOpen, setIsPasswordResetModalOpen] =
    useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <tr key={index}>
        <td>{account.id}</td>
        <td>{account.name}</td>
        <td>{account.email}</td>
        <td>{account.is_active ? "稼働中" : "停止中"}</td>
        <td>{account.role_text}</td>
        <td className="process">
          <span className="process-cell-inner">
            <a
              className="edit"
              onClick={() => setIsPasswordResetModalOpen(true)}
            >
              パスワード再設定
            </a>
            <a className="edit" onClick={() => switchMode(index, true)}>
              編集
            </a>
          </span>
        </td>
      </tr>
      {mounted &&
        isPasswordResetModalOpen &&
        ReactDOM.createPortal(
          (
            <PasswordResetModal
              account={account}
              officeId={officeId}
              onClose={() => setIsPasswordResetModalOpen(false)}
              onSuccess={onPasswordResetSuccess}
            />
          ) as any,
          document.body
        )}
    </>
  );
};

export default ListRow;
