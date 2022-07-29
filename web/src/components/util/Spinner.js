import style from './spinner.module.css';
export default function Spinner({ balls }) {
    if (balls) {
        return (<div className={style.balls}>
                <div className={style.ball}/>
                <div className={style.ball}/>
                <div className={style.ball}/>
            </div>);
    }
    return (<div className={style.container}/>);
}
