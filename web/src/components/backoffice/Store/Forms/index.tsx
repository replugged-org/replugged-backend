import type { Attributes } from 'preact'
import type { StoreForm } from '../../../../../../types/store'
import { h, Fragment } from 'preact'
import { useState, useEffect, useCallback, useRef, useContext } from 'preact/hooks'

import Tooltip from '../../../util/Tooltip'
import Spinner from '../../../util/Spinner'
import Modal from '../../../util/Modal'
import { TextareaField } from '../../../util/Form'
import { PublishForm, VerificationForm, HostingForm } from './Items'
import { Endpoints } from '../../../../constants'

import ExternalLink from 'feather-icons/dist/icons/external-link.svg'
import Check from 'feather-icons/dist/icons/check.svg'
import X from 'feather-icons/dist/icons/x.svg'

import style from '../../admin.module.css'
import sharedStyle from '../../../shared.module.css'
import UserContext from '../../../UserContext'
import { RestUser } from '../../../../../../types/users'

type FormProps = {
    form: StoreForm
    canViewDiscussions: boolean
}

type ModalProps = { onConfirm: (reason: string) => Promise<boolean>, onClose: () => void }

function ApproveModal({ onConfirm, onClose }: ModalProps) {
    const onConfirmWithData = onConfirm.bind(null, '')

    return (
        <Modal
            title='Approve a form'
            onConfirm={onConfirmWithData}
            onClose={onClose}
            confirmText='Approve'
            color='green'
        >
            <div>Are you sure you want to approve this form?</div>
        </Modal>
    )
}

function RejectModal({ onConfirm: onConfirmWithData, onClose }: ModalProps) {
    const [submitting, setSubmitting] = useState(false)
    const formRef = useRef<HTMLFormElement>(null)
    const onSubmit = useCallback(() => {
        if (!formRef.current) return
        setSubmitting(true)
        onConfirmWithData(formRef.current.reason.value).then((s) => {
            if (!s) {
                setSubmitting(false)
            }
        })
    }, [setSubmitting, onConfirmWithData])

    const onConfirm = useCallback(() => {
        if (!formRef.current) return
        formRef.current.requestSubmit()
    }, [formRef])

    return (
        <Modal
            processing={submitting}
            title='Reject a form'
            onConfirm={onConfirm}
            onClose={onClose}
            confirmText='Reject'
            color='red'
        >
            <form ref={formRef} onSubmit={(e) => { e.preventDefault(); onSubmit() }} className={style.loneForm}>
                <TextareaField
                    name='reason'
                    label='Reason'
                    note='Please specify a reason for the rejection. Maximum 256 chars.'
                    minLength={8}
                    maxLength={256}
                    required
                />
            </form>
        </Modal>
    )
}

function ReviewButtons({ form, canViewDiscussions }: FormProps) {
    const user = useContext(UserContext)!
    const [action, setAction] = useState(0)
    const closeModals = useCallback(() => setAction(0), [setAction])
    const approveForm = useCallback(() => setAction(1), [setAction])
    const rejectForm = useCallback(() => setAction(2), [setAction])

    const [formUser, setUser] = useState<any | null>(null)
    useEffect(() => {
        fetch(Endpoints.BACKOFFICE_USER(form.submitter!))
            .then((r) => r.json())
            .then((u) => setUser(u))
    }, [])

    const reviewForm = useCallback(async (reason: string) => {
        const resp = await fetch(Endpoints.BACKOFFICE_FORM(form._id), {
            method: 'PATCH',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({
                reviewed: true,
                approved: !reason,
                reviewer: user._id,
                reviewReason: reason || void 0,
            }),
        })

        if (resp.status === 200) {
            const res = await resp.json()
            console.log(res);
            setAction(res.couldDm ? 0 : 3)
        }

        return resp.status === 200
    }, [])

    return (
        <Fragment>
            <div className={sharedStyle.buttons}>
                <Tooltip text={'Can\'t connect to Replugged'} disabled={canViewDiscussions}>
                    <button className={sharedStyle.button} disabled={!canViewDiscussions}>
                        {/* @ts-ignore */}
                        <ExternalLink className={sharedStyle.icon} />
                        <span>View discussion</span>
                    </button>
                </Tooltip>
                {form.reviewed
                    ? <div className={style.alignCenter}>
                        {/* @ts-ignore */}
                        {form.approved ? <Check className={sharedStyle.icon} /> : <X className={sharedStyle.icon} />}
                        <span>{form.approved ? 'Approved' : 'Rejected'} by {form.reviewer.username}#{form.reviewer.discriminator}</span>
                    </div>
                    : <Fragment>
                        <button className={`${sharedStyle.button} ${sharedStyle.green}`} onClick={approveForm}>
                            {/* @ts-ignore */}
                            <Check className={sharedStyle.icon} />
                            <span>Approve</span>
                        </button>
                        <button className={`${sharedStyle.button} ${sharedStyle.red}`} onClick={rejectForm}>
                            {/* @ts-ignore */}
                            <X className={sharedStyle.icon} />
                            <span>Reject</span>
                        </button>
                    </Fragment>}
            </div>

            {action === 1 && <ApproveModal onConfirm={reviewForm} onClose={closeModals} />}
            {action === 2 && <RejectModal onConfirm={reviewForm} onClose={closeModals} />}
            {action === 3 && (
                <Modal title='Could not DM the user' onClose={closeModals}>
                    <div>
                        Failed to send a DM to the user, they either are not in the Replugged server or have their DMs closed.
                        You need to contact them manually.
                    </div>
                    <ul>
                        <li>Discord ID: {form.submitter}</li>
                        <li>Discord Tag: {formUser.username}#{formUser.discriminator}</li>
                    </ul>
                </Modal>
            )}
        </Fragment>
    )
}

function Form({ form, canViewDiscussions }: FormProps) {
    let body = null
    switch (form.kind) {
        case 'publish':
            body = <PublishForm form={form} />
            break
        case 'verification':
            body = <VerificationForm form={form} />
            break
        case 'hosting':
            body = <HostingForm form={form} />
            break
    }

    const [user, setUser] = useState<any | null>(null)
    useEffect(() => {
        fetch(Endpoints.BACKOFFICE_USER(form.submitter!))
            .then((r) => r.json())
            .then((u) => setUser(u))
    }, [])


    return (
        <section className={style.section}>
            <header className={style.sectionHeader}>
                <span className={style.sectionTitle}>{form.kind[0].toUpperCase()}{form.kind.slice(1)} form</span>
                <span className={style.sectionSubtitle}>
                    Submitted by {user ? <>{user.username}#{user.discriminator}</> : 'Deleted User'}
                </span>
            </header>
            <div className={style.sectionBody}>
                {body}
                <hr className={style.sectionSeparator} />
                <ReviewButtons form={form} canViewDiscussions={canViewDiscussions} />
            </div>
            <footer className={style.sectionFooter}>
                Form ID: {form._id}
            </footer>
        </section>
    )
}

export default function ManageForms(_: Attributes) {
    const [forms, setForms] = useState<StoreForm[] | null>(null)
    useEffect(() => {
        fetch(Endpoints.BACKOFFICE_FORMS)
            .then((r) => r.json())
            .then((f) => setForms(f.data))
    }, [])

    console.log(forms);

    return (
        <main>
            <h1 className={style.title}>Submitted forms</h1>

            {forms
                ? !forms.length
                    ? <div>All clear!</div>
                    : forms.map((f) => <Form key={f._id} form={f} canViewDiscussions={false} />)
                : <Spinner />}
        </main>
    )
}