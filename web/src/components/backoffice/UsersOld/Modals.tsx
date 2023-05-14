import type { Ref } from "preact";
import type { RestAdminUser } from "../../../../../types/users";
import { useCallback, useEffect, useRef, useState } from "preact/hooks";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { h } from "preact";

import Modal from "../../util/Modal";
import { CheckboxField, SelectField, TextField } from "../../util/Form";
import { Endpoints } from "../../../constants";

import style from "../admin.module.css";
import Tabs from "../../util/Tabs";

type ManageModalProps = { user: RestAdminUser; onClose: () => void };
type FormChunkProps = { user: RestAdminUser; formRef: Ref<HTMLFormElement> };

function FormProperties({ user, formRef, ...props }: FormChunkProps) {
  return (
    <form ref={formRef} onSubmit={(e) => e.preventDefault()} {...props}>
      <div className={style.form2}>
        <CheckboxField name="badgeDeveloper" label="Developer" value={user.badges?.developer} />
        <CheckboxField name="badgeStaff" label="Staff" value={user.badges?.staff} />
        <CheckboxField name="badgeSupport" label="Support" value={user.badges?.support} />
        <CheckboxField
          name="badgeContributor"
          label="Contributor"
          value={user.badges?.contributor}
        />
        <CheckboxField name="badgeHunter" label="Hunter" value={user.badges?.hunter} />
        <CheckboxField name="badgeEarly" label="Early" value={user.badges?.early} />
        <CheckboxField name="badgeTranslator" label="Translator" value={user.badges?.translator} />
      </div>
      <SelectField
        name="patronTier"
        label="Supporter tier"
        value={String(user.patronTier ?? 0)}
        options={[
          { id: "0", name: "Not donating" },
          { id: "1", name: "$1 Supporter" },
          { id: "2", name: "$5 Supporter" },
          { id: "3", name: "$10 Supporter" },
        ]}
      />
    </form>
  );
}

function FormPerks({ user, formRef, ...props }: FormChunkProps) {
  return (
    <form ref={formRef} onSubmit={(e) => e.preventDefault()} {...props}>
      <TextField
        name="color"
        label="Badges color"
        note="Hex code without the #. Defaults to blurple."
        value={user?.cutiePerks?.color ?? ""}
      />
      <TextField
        name="icon"
        label="Custom Badge"
        value={user?.cutiePerks?.badge ?? ""}
        preview={user?.cutiePerks?.badge ? <img src={user.cutiePerks.badge ?? ""} /> : null}
      />
      <TextField
        name="tooltip"
        label="Custom Badge Tooltip"
        value={user?.cutiePerks?.title ?? ""}
      />
    </form>
  );
}

type DatabaseBadge = {
  /** Guild id */
  _id: string;
  /** user id */
  userId: string;
  name: string;
  badge: string;
};

function FormGuildBadge({ user, formRef, ...props }: FormChunkProps) {
  const [perks, setPerks] = useState<DatabaseBadge | null>(null);
  useEffect(() => {
    fetch(Endpoints.BACKOFFICE_GET_USERS_GUILD_PERKS(user._id))
      .then((r) => r.json())
      .then((p) => setPerks(p));
  }, []);

  return (
    <form ref={formRef} onSubmit={(e) => e.preventDefault()} {...props}>
      <TextField name="color" label="Guild ID" value={perks?._id ?? ""} />
      <TextField
        name="icon"
        label="Guild Badge"
        value={perks?.badge ?? ""}
        preview={perks?.badge ? <img src={perks.badge} /> : null}
      />
      <TextField name="tooltip" label="Guild Badge Tooltip" value={perks?.name ?? ""} />
    </form>
  );
}

export function ManageEdit({ user, onClose }: ManageModalProps) {
  const [processing, setProcessing] = useState(false);
  const formPropertiesRef = useRef<HTMLFormElement>(null);
  const formPerksRef = useRef<HTMLFormElement>(null);
  const formGuildPerksRef = useRef<HTMLFormElement>(null);

  const onSave = useCallback(() => {
    if (!formPropertiesRef.current && !formPerksRef.current && !formGuildPerksRef.current) {
      return;
    }
    const data: Record<string, unknown> = {};
    setProcessing(true);

    if (formPropertiesRef.current) {
      data.patronTier = Number(formPropertiesRef.current.patronTier.value);
      data["badges.developer"] = formPropertiesRef.current.badgeDeveloper.checked;
      data["badges.staff"] = formPropertiesRef.current.badgeStaff.checked;
      data["badges.support"] = formPropertiesRef.current.badgeSupport.checked;
      data["badges.contributor"] = formPropertiesRef.current.badgeContributor.checked;
      data["badges.hunter"] = formPropertiesRef.current.badgeHunter.checked;
      data["badges.early"] = formPropertiesRef.current.badgeEarly.checked;
      data["badges.translator"] = formPropertiesRef.current.badgeTranslator.checked;
    }

    if (formPerksRef.current) {
      data["badges.custom.color"] = formPerksRef.current.color.value || null;
      data["badges.custom.icon"] = formPerksRef.current.icon.value || null;
      data["badges.custom.name"] = formPerksRef.current.tooltip.value || null;
    }

    if (formGuildPerksRef.current) {
      data["badges.guild.id"] = formGuildPerksRef.current.color.value || null;
      data["badges.guild.icon"] = formGuildPerksRef.current.icon.value || null;
      data["badges.guild.name"] = formGuildPerksRef.current.tooltip.value || null;
    }

    fetch(Endpoints.BACKOFFICE_USER(user._id), {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(data),
    }).then(() => onClose());
  }, []);

  return (
    <Modal
      title={`Modify user - ${user.username}#${user.discriminator}`}
      confirmText="Save"
      onClose={onClose}
      onConfirm={onSave}
      processing={processing}>
      <Tabs>
        <div data-tab-id="PROPERTIES" data-tab-name="Manage">
          <FormProperties user={user} formRef={formPropertiesRef} />
        </div>
        <div data-tab-id="PERKS" data-tab-name="Perks">
          <FormPerks user={user} formRef={formPerksRef} />
        </div>
        <div data-tab-id="GUILD" data-tab-name="Guild badge">
          <FormGuildBadge user={user} formRef={formGuildPerksRef} />
        </div>
      </Tabs>
    </Modal>
  );
}

export function ManageModeration({ user, onClose }: ManageModalProps) {
  const [processing, setProcessing] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const onApply = useCallback((e?: Event) => {
    if (e) {
      e.preventDefault();
    }
    if (!formRef.current) {
      return;
    }
    setProcessing(true);

    const userbans = {
      publish: formRef.current.publish.checked,
      verification: formRef.current.verification.checked,
      hosting: formRef.current.hosting.checked,
      reporting: formRef.current.reporting.checked,
      sync: formRef.current.sync.checked,
      events: formRef.current.events.checked,
    };

    if (!Object.values(userbans).filter((b) => b).length) {
      fetch(Endpoints.BACKOFFICE_BAN(user._id), {
        method: "DELETE",
        headers: { "content-type": "application/json" },
      }).then(() => onClose());
      return;
    }

    fetch(Endpoints.BACKOFFICE_BAN(user._id), {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(userbans),
    }).then(() => onClose());
  }, []);

  return (
    <Modal
      title={`User bans - ${user.username}#${user.discriminator}`}
      onClose={onClose}
      onConfirm={onApply}
      confirmText="Apply"
      processing={processing}>
      <form ref={formRef} onSubmit={onApply}>
        <CheckboxField
          name="publish"
          label="Store publish request"
          note="Forbids the user from sending publish requests."
          value={user.banStatus?.publish}
        />
        <CheckboxField
          name="verification"
          label="Store verification request"
          note="Forbids the user from requesting to get a work verified."
          value={user.banStatus?.verification}
        />
        <CheckboxField
          name="hosting"
          label="Hosting request"
          note="Forbids the user from requesting free hosting for a plugin backend."
          value={user.banStatus?.hosting}
        />
        <CheckboxField
          name="reporting"
          label="Reporting features"
          note="Forbids the user from sending reports of contents in the store."
          value={user.banStatus?.reporting}
        />
        <CheckboxField
          name="sync"
          label="Setting sync"
          note="Forbids the user from using the Settings Sync feature on replugged.dev."
          value={user.banStatus?.sync}
        />
        <CheckboxField
          name="events"
          label="Community events"
          note="Forbids the user from participating in Replugged-organized events."
          value={user.banStatus?.events}
        />
      </form>
    </Modal>
  );
}

export function ManageDelete({ user, onClose }: ManageModalProps) {
  const [processing, setProcessing] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const onYeet = useCallback(() => {
    setProcessing(true);
    fetch(Endpoints.BACKOFFICE_USER(user._id), { method: "DELETE" }).then(() => {
      if (formRef.current?.ban.checked) {
        fetch(Endpoints.BACKOFFICE_BAN(user._id), {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ account: true }),
        }).then(() => onClose());
      } else {
        onClose();
      }
    });
  }, []);

  return (
    <Modal
      title="Delete an account"
      onClose={onClose}
      onConfirm={onYeet}
      confirmText="Yeet"
      processing={processing}
      color="red">
      <div>
        Are you sure you want to delete {user.username}'s account?{" "}
        <b>This action is irreversible</b>!
      </div>
      <hr />
      <form ref={formRef}>
        <CheckboxField
          name="ban"
          label="Ban the user as well"
          note="The user will not be able to create a new Replugged account with this Discord account."
          value={user.banStatus?.account}
        />
      </form>
    </Modal>
  );
}
