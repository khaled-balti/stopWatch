import { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.css'
import './App.css'
import { FaArrowRotateLeft } from "react-icons/fa6";
import { FaFireAlt } from "react-icons/fa";
import { FaStop } from "react-icons/fa";
import { MdNotStarted } from "react-icons/md";
const defaultState = {
  millis: '00',
  secs: '00',
  hours: '00',
  minutes: '00',
};

let startDuration = null;
let elapsedTime = 0;
let finishedUsers = 0;
function getZeroAppendedString(num) {
  return ('0' + num).slice(-2);
}

function calculateTime() {
  let millisecondsPassed = new Date().getTime() - startDuration + elapsedTime;
  let millisecondsTimer = getZeroAppendedString(
    String(millisecondsPassed % 1000).substring(0, 2)
  );
  let secondsPassed = Math.floor(millisecondsPassed / 1000);
  let secondsPassedTimer = secondsPassed % 60;
  let minutesPassed = Math.floor(secondsPassed / 60);
  let minutesPassedTimer = minutesPassed % 60;
  let hoursPassed = Math.floor(minutesPassed / 60) % 24;
  secondsPassed = getZeroAppendedString(secondsPassedTimer);
  minutesPassed = getZeroAppendedString(minutesPassedTimer);
  hoursPassed = getZeroAppendedString(hoursPassed);
  return {
    millis: millisecondsTimer,
    secs: secondsPassed,
    hours: hoursPassed,
    minutes: minutesPassed,
  };
}

export default function Stopwatch() {
  let [time, setTime] = useState(defaultState);
  let [isStarted, setIsStarted] = useState(false);
  let [intervalId, setIntervalId] = useState(null);
  const [users, setUsers] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isShown, setIsShown] = useState(false);
  const [timesDetected, setTimesDetected] = useState([])

  useEffect(() => {
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [intervalId]);

  const handleNumberChange = (e) => {
    setUsers(parseInt(e.target.value));
  };

  function formatTime(milliseconds) {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const totalMinutes = Math.floor(totalSeconds / 60);
    const totalHours = Math.floor(totalMinutes / 60);
  
    const hours = totalHours % 24;
    const minutes = totalMinutes % 60;
    const seconds = totalSeconds % 60;
    const millis = Math.floor((milliseconds % 1000) / 10); // For nn (hundredths of a second)
  
    const getZeroAppendedString = (num) => ('0' + num).slice(-2);
  
    const formattedHours = getZeroAppendedString(hours);
    const formattedMinutes = getZeroAppendedString(minutes);
    const formattedSeconds = getZeroAppendedString(seconds);
    const formattedMillis = getZeroAppendedString(millis);
  
    return `${formattedHours}:${formattedMinutes}:${formattedSeconds}:${formattedMillis}`;
  }

  function startTimer() {
    if (users !== 0) {
      setIsProcessing(true)
      if (!isProcessing && timesDetected.length > 0) {
        setTimesDetected([])
      }
      setIsShown(true)
      startDuration = new Date().getTime();
      const id = setInterval(() => {
        setTime(calculateTime());
      }, 20);
      setIntervalId(id);
      setIsStarted(true);
    }
  }

  function resetTimer() {
    setTime(defaultState);
    setIsProcessing(false);
    setUsers(1);
    setIsStarted(false);
    clearInterval(intervalId);
    setIntervalId(null);
    startDuration = null;
    elapsedTime = 0;
    finishedUsers = 0;
  }

  function stopHandler() {
    clearInterval(intervalId);
    setIntervalId(null);
    setIsStarted(false);
  
    if (startDuration) {
      let currentTime = new Date().getTime();
      elapsedTime += currentTime - startDuration;
    }
    startDuration = null;
  }

  function detectLapHandler() {
    finishedUsers += 1;
    if (finishedUsers <= users) {
      let currentTime = new Date().getTime();
      if (isStarted) {
        elapsedTime += currentTime - startDuration;
        startDuration = currentTime;
      }
      setTimesDetected(prev => [...prev, { lapNum: finishedUsers, elapsedTime}]);
      if (finishedUsers === users) {
        if (isStarted) {
          clearInterval(intervalId);
          setIntervalId(null);
          setIsStarted(false);
          setIsProcessing(false);
        }
        setTimeout(resetTimer, 100)
      }
    }
  }

  const resetTimerHandler = () => {
    resetTimer();
    setIsShown(false)
  }

  return (
    <div className='container-fluid d-flex justify-content-center align-items-center' style={{height: '100vh', backgroundColor: "#FDD6D6"}}>
      <div className='container cont py-4 px-5'>
        <p className='text-white fs-2 text-center'>StopWatch</p>
        <input type='number' className='w-100 input mt-2 ps-2' onChange={handleNumberChange} min={1} value={users} />
        <div className='timer d-flex justify-content-center align-items-center flex-column mt-4 mx-auto pt-5'>
          <p className='time mt-3' style={{fontSize: '50px'}}>{`${time.hours}:${time.minutes}:${time.secs}`}</p>
          <p className='fs-4 time text-end'>{time.millis}</p>
        </div>
        <div className='d-flex mt-4 justify-content-evenly align-items-center'>
          <div onClick={resetTimerHandler} className='button d-flex justify-content-center align-items-center fw-semibold'><FaArrowRotateLeft size={20} /></div>
          <div onClick={!isStarted ? startTimer : stopHandler} className={`mainBtn d-flex justify-content-center align-items-center fw-semibold`}>{!isStarted ? <MdNotStarted size={30} /> : <FaStop size={30} />}</div>
          {finishedUsers < users && isProcessing && (<div onClick={detectLapHandler} className={`button d-flex justify-content-center align-items-center fw-semibold`}>
            <FaFireAlt size={20} />
          </div>)}
        </div>
        {isShown && timesDetected.length > 0 && <div className={`board container-fluid mt-4 py-3 px-4 overflow-x-hidden ${finishedUsers > 3 ? 'overflow-y-scroll' : 'overflow-y-auto'}`}>
          {timesDetected.map((lap, index) => {
            return (
              <div className='d-flex justify-content-between align-items-center'>
                <p className='fw-semibold'>{`Lap ${lap.lapNum}: ${formatTime(lap.elapsedTime)}`}</p>
                <p>{index === 0 ? `+${formatTime(0)}` : `+${formatTime(lap.elapsedTime - timesDetected[index-1].elapsedTime)}`}</p>
              </div>
            )
          })}
        </div>}
      </div>
    </div>
  )
}
