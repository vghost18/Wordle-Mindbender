import { useEffect, useState } from 'react';
import {  Text, View, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { colors, CLEAR, ENTER, colorsToEmoji } from '../../constants';
import Keyboard from "../Keyboard";
import words from '../../words';
import styles from "./Game.styles"
import { copyArray, getDayOfTheYear, getDayKey } from '../../utils';
import AsyncStorage from '@react-native-async-storage/async-storage';
import EndScreen from '../EndScreen';
import Animated, {FlipInEasyX, FlipInEasyY, SlideInDown,
  SlideInLeft,
  SlideInRight,
  SlideInUp,SlideOutTop, ZoomIn, ZoomInDown, ZoomInEasyDown, ZoomInEasyUp, ZoomInLeft, ZoomInRight, ZoomInRotate, ZoomInUp} from 'react-native-reanimated';


const NUMBER_OF_TRIES = 6;
const dayOfTheYear = getDayOfTheYear();
const daykey = getDayKey();

const Game = () => {
  AsyncStorage.removeItem("@game");
  
  // const dayOfTheYear = getDayOfTheYear();
  // const daykey = `day-${dayOfTheYear}`

  const word = words[dayOfTheYear];
  const letters = word.split("");

  const [rows, setRows] = useState(new Array(NUMBER_OF_TRIES).fill(new Array(letters.length).fill("")));
  const [curRow, setCurRow] = useState(0);
  const [curCol, setCurCol] = useState(0);
  const [gameState, setGameState] = useState('playing');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (curRow > 0) {
      checkGameState();
    }
  }, [curRow]);

  useEffect(() => {
    if (loaded) {
      persistState();
    };
  }, [rows,curCol,curRow, gameState]);

  useEffect(() => {
    readState();
  },[])

  const persistState = async() => {
    
    const dataForToday ={
      rows,
      curRow,
      curCol,
      gameState,
    };
    try {
      const existingStateString = await AsyncStorage.getItem("@game");
      const existingState = existingStateString ? JSON.parse(existingStateString): {};
     
      existingState[daykey] = dataForToday
      const dataString = JSON.stringify(existingState);
      console.log("saving", dataString);
      await AsyncStorage.setItem("@game", dataString)
    }catch (e) {
      console.log("Failed to write the data in the Async storage", e);
    }

  };
  const readState = async () => {
    //await AsyncStorage.clear();
    const dataString = await AsyncStorage.getItem("@game");
    console.log(dataString);
    try {
      const data = JSON.parse(dataString);
      const day = data[daykey];
      setRows(day.rows);
      setCurCol(day.curCol);
      setCurRow(day.curRow);
      setGameState(day.gameState);
    } catch(e) {
      console.log("Couldn't parse the data");
    }
    setLoaded(true);
  };

  const checkGameState = () => {
    if (checkIfWon() && gameState !== "won") {
      // Alert.alert("Huraaay", "You won!", [
      //   { text: "Share", onPress: shareScore },
      // ]);
      setGameState("won");
    } else if (checkIfLost() && gameState !== "lost") {
      // Alert.alert("Meh", "Try again tomorrow!");
      setGameState("lost");
    }
  };



  const checkIfWon = () => {
    const row = rows[curRow - 1];

    return row.every((letter, i) => letter === letters[i]);
  };

  const checkIfLost = () => {
    return !checkIfWon() && curRow === rows.length;
  };

  const onKeyPressed = (key) => {
    if (gameState !== "playing") {
      return;
    }

    const updatedRows = copyArray(rows);

    if (key === CLEAR) {
      const prevCol = curCol - 1;
      if (prevCol >= 0) {
        updatedRows[curRow][prevCol] = "";
        setRows(updatedRows);
        setCurCol(prevCol);
      }
      return;
    }

    if (key === ENTER) {
      if (curCol === rows[0].length) {
        setCurRow(curRow + 1);
        setCurCol(0);
      }

      return;
    }

    if (curCol < rows[0].length) {
      updatedRows[curRow][curCol] = key;
      setRows(updatedRows);
      setCurCol(curCol + 1);
    }
  };

  const isCellActive = (row, col) => {
    return row === curRow && col === curCol;
  };

  const getCellBGColor = (row, col) => {
    const letter = rows[row][col];

    if (row >= curRow) {
      return colors.black;
    }
    if (letter === letters[col]) {
      return colors.primary;
    }
    if (letters.includes(letter)) {
      return colors.secondary;
    }
    return colors.darkgrey;
  };

  const getAllLettersWithColor = (color) => {
    return rows.flatMap((row, i) =>
      row.filter((cell, j) => getCellBGColor(i, j) === color)
    );
  };

  const greenCaps = getAllLettersWithColor(colors.primary);
  const yellowCaps = getAllLettersWithColor(colors.secondary);
  const greyCaps = getAllLettersWithColor(colors.darkgrey);
  const getCellStyle = (i, j) => 
    [
      styles.cell,
      {
        borderColor: isCellActive(i, j)
          ? colors.grey
          : colors.darkgrey,
        backgroundColor: getCellBGColor(i, j),
      },
    ];
  
  if (!loaded) {
    return(<ActivityIndicator/>)
  }
  if (gameState !== "playing") {
    return <EndScreen won={gameState === "won"} rows={rows} getCellBGColor={getCellBGColor}/>;
  }


  return (
    <>
      <ScrollView style={styles.map}>
        {rows.map((row, i) => (
          <Animated.View entering={SlideInDown.duration(2000).delay(i*500)}
           key={`row-${i}`} style={styles.row}>
            {row.map((letter, j) => (
              <>
              {i < curRow && (<Animated.View entering={FlipInEasyY.delay(j*300)}
                key={`cell-color-${i}-${j}`}
                style={getCellStyle(i, j)}
              >
                <Text style={styles.cellText}>{letter.toUpperCase()}</Text>
              </Animated.View>
              )}
              {i === curRow && !!letter && (<Animated.View entering={ZoomInEasyUp}
                key={`cell-active-${i}-${j}`}
                style={getCellStyle(i, j)}
              >
                <Text style={styles.cellText}>{letter.toUpperCase()}</Text>
              </Animated.View>
              )}
              {!letter && (<View
                key={`cell-${i}-${j}`}
                style={getCellStyle(i, j)}
              >
                <Text style={styles.cellText}>{letter.toUpperCase()}</Text>
              </View>
              )}
              </>
            ))}
          </Animated.View>
        ))}
      </ScrollView>

      <Keyboard
        onKeyPressed={onKeyPressed}
        greenCaps={greenCaps} // ['a', 'b']
        yellowCaps={yellowCaps}
        greyCaps={greyCaps}
      />
    </>

  );
}
export default Game;