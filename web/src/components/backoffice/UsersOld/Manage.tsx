import type { RestAdminUser } from "../../../../../types/users";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { VNode, h } from "preact";
import { useCallback, useEffect, useReducer, useRef, useState } from "preact/hooks";

import Spinner from "../../util/Spinner";
import Tooltip from "../../util/Tooltip";
import Paginator from "../../util/Paginator";
import Modal from "../../util/Modal";
import { DiscordAvatar } from "../../util/Avatar";
import { TextField } from "../../util/Form";
import { ManageDelete, ManageEdit, ManageModeration } from "./Modals";
import { Endpoints } from "../../../constants";

import Edit from "feather-icons/dist/icons/edit.svg";
import Shield from "feather-icons/dist/icons/shield.svg";
import Trash from "feather-icons/dist/icons/trash-2.svg";

import style from "../admin.module.css";
import sharedStyle from "../../shared.module.css";
import { getDisplayNameString } from "../../util/misc";

interface UserStore {
  [page: number]: RestAdminUser[];
}
interface UserStoreAction {
  users: RestAdminUser[];
  page: number;
}
interface ApiResponse {
  data: RestAdminUser[];
  pages: number;
}
type ModalState = { kind: "edit" | "mod" | "delete"; user: RestAdminUser } | { kind: "id" };

const Status = { IDLE: 0, PROCESSING: 1, NOT_FOUND: 2, FOUND: 3 };

function userReducer(state: UserStore, action: UserStoreAction): UserStore {
  return { ...state, [action.page]: action.users };
}

function EditById({ onClose }: { onClose: () => void }): VNode {
  const [status, setStatus] = useState(Status.IDLE);
  const [user, setUser] = useState<RestAdminUser | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const doEditById = useCallback((e?: Event) => {
    if (e) {
      e.preventDefault();
    }
    if (!formRef.current) {
      return;
    }

    if (!formRef.current.userId.value) {
      return;
    }
    setStatus(Status.PROCESSING);
    fetch(Endpoints.BACKOFFICE_USER(formRef.current.userId.value)).then((r) => {
      if (r.status !== 200) {
        return setStatus(Status.NOT_FOUND);
      }
      r.json().then((u) => {
        setUser(u);
      });
    });
  }, []);

  useEffect(() => formRef.current?.querySelector("input")?.focus(), []);

  if (user) {
    return <ManageEdit user={user} onClose={onClose} />;
  }

  return (
    <Modal
      title="Edit a user by ID"
      onConfirm={doEditById}
      onClose={onClose}
      confirmText="Edit"
      processing={status === Status.PROCESSING}>
      <form className={style.loneForm} ref={formRef} onSubmit={doEditById}>
        <TextField
          label="User ID"
          name="userId"
          error={status === Status.NOT_FOUND ? "This user cannot be found." : void 0}
        />
      </form>
    </Modal>
  );
}

function UserRow({
  user,
  setModal,
}: {
  user: RestAdminUser;
  setModal: (s: ModalState) => void;
}): VNode {
  const bans = user.banStatus
    ? Object.entries(user.banStatus)
        .filter(([, isBanned]) => isBanned)
        .map(([key]) => key)
    : [];

  const editUser = useCallback(() => setModal({ kind: "edit", user }), [user, setModal]);
  const moderateUser = useCallback(() => setModal({ kind: "mod", user }), [user, setModal]);
  const deleteUser = useCallback(() => setModal({ kind: "delete", user }), [user, setModal]);

  return (
    <div className={style.row}>
      <DiscordAvatar user={user} />
      <div className={style.rowInfo}>
        <span>{getDisplayNameString(user)}</span>
        <span className={bans.length ? sharedStyle.red : ""}>
          {bans.length ? `Active bans: ${bans.join(", ")}` : "No active bans"}
        </span>
      </div>
      <div className={style.rowActions}>
        <Tooltip text="Edit user">
          <button className={style.action} onClick={editUser}>
            <Edit />
          </button>
        </Tooltip>
        <Tooltip text="Manage user bans">
          <button className={style.action} onClick={moderateUser}>
            <Shield />
          </button>
        </Tooltip>
        <Tooltip text="Delete user account">
          <button className={style.action} onClick={deleteUser}>
            {/* @ts-expect-error class */}
            <Trash className={sharedStyle.red} />
          </button>
        </Tooltip>
      </div>
    </div>
  );
}

export default function ManageUsers(): VNode {
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(0);
  const [usersStore, pushUsers] = useReducer(userReducer, {});
  const [modal, setModal] = useState<ModalState | null>(null);
  const editById = useCallback(() => setModal({ kind: "id" }), [setModal]);
  const users = usersStore[page];

  const fetchUserPage = useCallback(() => {
    fetch(`${Endpoints.BACKOFFICE_USERS}?page=${page}`)
      .then((r) => r.json())
      .then((u: ApiResponse) => {
        pushUsers({ users: u.data, page });
        console.log(u);
        if (!pages) {
          setPages(u.pages);
        }
      });
  }, [page]);

  useEffect(fetchUserPage, [page]);
  const onModalClose = useCallback(() => {
    setModal(null);
    fetchUserPage();
  }, []);

  return (
    <main>
      <h1 className={style.title}>Manage users</h1>
      <div className={style.toolbar}>
        {/* <TextField name='search' label='Search' placeholder='Search a user...' raw disabled/> */}
        <button className={sharedStyle.button} onClick={editById}>
          Edit a user by ID
        </button>
      </div>
      {users ? users.map((u) => <UserRow key={u._id} user={u} setModal={setModal} />) : <Spinner />}
      {pages > 1 && <Paginator current={page} total={pages} setPage={setPage} />}

      {modal?.kind === "id" && <EditById onClose={onModalClose} />}
      {modal?.kind === "edit" && <ManageEdit user={modal.user} onClose={onModalClose} />}
      {modal?.kind === "mod" && <ManageModeration user={modal.user} onClose={onModalClose} />}
      {modal?.kind === "delete" && <ManageDelete user={modal.user} onClose={onModalClose} />}
    </main>
  );
}
