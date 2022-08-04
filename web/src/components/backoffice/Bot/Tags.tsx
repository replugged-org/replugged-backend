import { h } from 'preact';
import { useCallback, useEffect, useState } from 'preact/hooks';
import { DiscordEmbed } from '../../../../../types/discord'
import { Endpoints } from '../../../constants'
import Spinner from '../../util/Spinner';


import style from './tags.module.css'
import sharedStyle from '../../shared.module.css'
import Tooltip from '../../util/Tooltip';

import Edit from 'feather-icons/dist/icons/edit.svg'
import Trash from 'feather-icons/dist/icons/trash-2.svg'

type ModalState = {
    kind: 'edit' | 'delete',
    tag: DatabaseTag
} | { kind: 'id' }

type DatabaseTag = {
    _id: string,
    content: string,
    embed?: DiscordEmbed
}

type TagRowProps = {
    tag: DatabaseTag
    setModal: (s: ModalState) => void
}

function TagRow({ tag, setModal }: TagRowProps) {

    const editTag = useCallback(() => setModal({ kind: 'edit', tag }), [tag, setModal])
    const deleteTag = useCallback(() => setModal({ kind: 'delete', tag }), [tag, setModal])

    return (
        <div className={style.row}>
            <div className={style.rowInfo}>
                <span className={style.tagTitle}>{tag._id}</span>
                <span>{tag.content || tag.content.length > 0 ? tag.content.length > 128 ? `${tag.content.slice(128)}...` : tag.content : null}</span>
            </div>
            <div className={style.rowActions}>
                {tag.embed !== undefined || tag.embed !== null ? (
                    <div>
                        <p>embed</p>
                    </div>
                ) : null}
                <Tooltip text='Edit tag'>
                    <button className={style.action} onClick={editTag}>
                        <Edit />
                    </button>
                </Tooltip>
                <Tooltip text='Delete tag'>
                    <button className={style.action} onClick={deleteTag}>
                        <Trash />
                    </button>
                </Tooltip>
            </div>
        </div>
    )

}

export default function () {
    const [tags, setTags] = useState<DatabaseTag[] | null>(null)
    const [modal, setModal] = useState<ModalState | null>(null)
    useEffect(() => {
        fetch(Endpoints.BACKOFFICE_TAGS)
            .then((r) => r.json())
            .then((r) => setTags(r.data))
    }, [])

    console.log(tags);

    return (
        <main>
            <h1 className={style.title}>Manage tags</h1>
            <div className={style.toolbar}>
                <button className={sharedStyle.button} onClick={void 0}>Create a tag</button>
            </div>
            {tags ? tags.map((tag) => <TagRow setModal={setModal} tag={tag} />) : <Spinner />}
        </main>
    )
}