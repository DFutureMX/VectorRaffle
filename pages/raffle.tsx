import type { NextPage } from 'next'

/* React */
import React, { useState, useEffect } from 'react'

/* Components */
import Head from 'next/head'
import Link from 'next/link'
import styles from '../styles/Raffle.module.css'
import Image from 'next/image'
import Logo from '../public/img/vector.svg'
/* Redux */
import { selectParticipants } from "../redux/states/participants/reducer"
import { useAppSelector } from '../redux/hooks'
import { Participant } from '../redux/states/participants/interfaces'

/* Material UI */
import Tooltip from '@mui/material/Tooltip';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';


/* Motion */
import { motion } from "framer-motion"

const Raffle: NextPage = () => {

    /* useState - upload */
    const [state, setState] = useState({
        winnerStatus: 0,
        winnerName: "",
        winners: 0,
        animationIteration: 2,
        numParticipants: 0,
    });

    const [name, setName] = useState<string>("ABRAHAM CEPEDA");

    const [intervalID, setIntervalID] = useState<number>(0);
    const [slow, setSlow] = useState<boolean>(false);

    /* Redux */
    const participants = useAppSelector(selectParticipants) //function that allows to get the Participants from the redux state


    /* Shuffle array */
    function shuffle(array: []) {
        let currentIndex = array.length,  randomIndex;

        // While there remain elements to shuffle.
        while (currentIndex != 0) {

            // Pick a remaining element.
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;

            // And swap it with the current element.
            [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
        }

        return array;
    }

    let index = 0;
    let num = 0;
    let stop = false;
    //@ts-ignore
    let interval;
    let final = Math.floor(Math.random() * participants.length + 10);


    const slowInterval = (temp:Participant[]) => {

        //@ts-ignore
        if (interval) {
            //@ts-ignore
            clearInterval(interval)
            interval = null
        }
        stop = false;
        
        interval = setInterval(() => {
            if(!stop){
                num = num + 1;
                if(num === final) {
                    index = index + 1;
                    if(temp.length === 1) {
                        setName(temp[0].nombre);
                        setState({...state, numParticipants: temp.length, winnerStatus: 1, winnerName: temp[0].nombre});
                    } else {
                        setName(temp[index].nombre);
                        setState({...state, numParticipants: temp.length, winnerStatus: 1, winnerName: temp[index].nombre});
                    }
                    
                    stop = true;
                    clearInterval(intervalID);
                    //@ts-ignore
                    clearInterval(interval);
                    interval = null;
                } else if(index < (temp.length-2)) {
                    index = index + 1;
                    setName(temp[index].nombre);
                } else {
                    index = index + 1;
                    index = 0;
                }
            } else {
                //@ts-ignore
                clearInterval(interval);
            }

        }, 1000)

        //@ts-ignore
        setIntervalID(interval);
    }
    
    const runInterval = (time:number) => {
        //@ts-ignore
        if (interval) {
            //@ts-ignore
            clearInterval(interval)
            interval = null
        }
        console.log("final: " + final);

        let temp: Participant[] = participants;

        if(localStorage.getItem("deletedNames") !== null) {
            let deletedNames = JSON.parse(localStorage.getItem("deletedNames")!);
            temp = temp.filter((item:Participant) => !deletedNames.includes(item.nombre));
        }  
        
        //@ts-ignore
        temp = shuffle(temp);
       

        interval = setInterval(() => {
            if(!stop){
                num = num + 1;
                if(num === (final - 3))  {
                    setSlow(true);
                    stop = true;

                    clearInterval(intervalID);
                    //@ts-ignore
                    clearInterval(interval);
                    interval = null;
                    slowInterval(temp);
                } else if(temp.length === 1) {
                    index = index + 1;
                    setName(temp[0].nombre);
                    setState({...state, numParticipants: temp.length, winnerStatus: 1, winnerName: temp[0].nombre});
                } else if(index < (temp.length-2)) {
                    index = index + 1;
                    setName(temp[index].nombre);
                } else {
                    index = index + 1;
                    setName(temp[index].nombre);
                    index = 0;
                }
            } else {
                //@ts-ignore
                clearInterval(interval);
                interval = null;
            }

        }, time)

    }
    

    useEffect(() => {

        if (participants.length > 0) {
            localStorage.setItem("deletedNames", JSON.stringify([]));
            setState({...state, numParticipants: participants.length});
            runInterval(10);
        }

    } ,[]);

    /* Handle replay raffle without winner */
    const handleReplayClick = () => {
        //delete winner from participants

        if(localStorage.getItem("deletedNames") !== null) {
            let temp = JSON.parse(localStorage.getItem("deletedNames")!);
            temp.push(state.winnerName);
            localStorage.setItem("deletedNames", JSON.stringify(temp));
        } else {
            localStorage.setItem("deletedNames", JSON.stringify([state.winnerName]));
        }
        
        setState({...state, winnerStatus: 0, winnerName: "", numParticipants: state.numParticipants - 1, animationIteration: state.animationIteration + 3});
        setSlow(false);
        runInterval(10);
    }

    /* Handle replay raffle with all participans */
    const handleReplayAllClick = () => {
        localStorage.setItem("deletedNames", JSON.stringify([]));
        setState({...state, winnerStatus: 0, winnerName: "", numParticipants: participants.length, animationIteration: state.animationIteration + 3});
        setSlow(false);
        runInterval(10);
    }



    const variants = {

        fast: {
            rotate: [0, 360],
            transition: {
                duration: 0.5,
                repeat: Infinity,
                ease: "linear",
            }},
        slow: {
            rotate: [0, 360], 
            transition: {
                duration: 3,
                repeat: 0,
                ease: "linear",
            }},
    }
  
  return (
    <div>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <div className={styles.overlay}>
            {/* outer circle */}
            <motion.div className={slow ? styles.outer__circle2 : styles.outer__circle} style={{animationIterationCount: !slow ? 'infinite': state.animationIteration}}
                animate={slow ? "slow" : "fast"}
                variants={variants}
                //infinite durationn


            >
                <div className={styles.ball}></div>
            </motion.div>

            {/* inner circle */}
            <div className={styles.circle}></div>

            {/* Card */}
            <div className={styles.card__container}>
                <div>
                    {/* Winner title */}
                    {state.winnerStatus === 1 && (
                        <h2 className={styles.winner__title}>¡Ganador!</h2>
                    )}

                    {/* name */}
                    <h1 className={styles.name}>{name.toUpperCase()}</h1>
                </div>
            </div>

            {/* Participants and buttons */}
            <div className={styles.actions__container}>
                {/* participants number */}
                <div className={styles.icon__container}>
                    <PersonRoundedIcon className={styles.person__icon} />
                    <p className={styles.participants}>{state.numParticipants ? state.numParticipants : "--"}/{participants.length ? participants.length : "--"}</p>
                </div>

                {/* action buttons */}
                {state.winnerStatus === 1 && (
                    <div className={styles.buttons}>

                        
                        {/* <Image className={styles.icon__image} src={Redo} width={35} height={35}/> */}
                        <Tooltip title="Replay without winner" placement="top">
                            <img onClick={handleReplayClick} className={styles.icon__image} style={{marginRight: '10px'}} src="/img/redo_w.svg" alt="Redo without winner"/>
                        </Tooltip>

                        {/* Replay with all participants */}
                        <Tooltip title="Replay with all" placement="top">
                            <img onClick={handleReplayAllClick} className={styles.icon__image} style={{marginRight: '10px'}} src="/img/redo.svg" alt='Redo all'/>
                        </Tooltip>

                        {/* Do another raffle */}
                        <Tooltip title="Do another raffle" placement="top">
                            <Link href="/">
                                <img className={styles.icon__image} src="/img/another.svg" alt='Another'/>
                            </Link>
                        </Tooltip>
                    </div>    
                )}
                
            </div>

            {/* Logo image */}
            <div className={styles.title__container}>
                <div className={styles.logo__container}>
                  <Image src={Logo} width={80} height={60} alt="Vector"/>
              </div>
                <h1 className={styles.title}>RIFA NAVIDEÑA VECTOR 2023</h1>
            </div>
        </div>

      </main>

    </div>
  )
}

export default Raffle;
