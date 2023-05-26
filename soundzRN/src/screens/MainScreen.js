/* eslint-disable react/no-unstable-nested-components */
import React, {useEffect, useState} from 'react';
import type {PropsWithChildren} from 'react';
import {
  ActivityIndicator,
  AppState,
  Dimensions,
  Image,
  Linking,
  NativeModules,
  PermissionsAndroid,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';

import Video from 'react-native-video';
import LessionsList from './LessionsList';
import EvilIcons from 'react-native-vector-icons/EvilIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FastIcon from '../assets/svg/fast.svg';
import SlowIcon from '../assets/svg/slow.svg';
import FrontIcon from '../assets/svg/frontview.svg';
import SideIcon from '../assets/svg/sideview.svg';
import VideoIcon from '../assets/svg/video-mode.svg';
import VideoActiveIcon from '../assets/svg/video-mode-active.svg';
import LessionIcon from '../assets/svg/lesson-intro.svg';
import LessionActiveIcon from '../assets/svg/lesson-intro-active.svg';
import AlphaIcon from '../assets/svg/phoneme_alpha.svg';
import LatinIcon from '../assets/svg/phoneme_latin.svg';
import IpaIcon from '../assets/svg/phoneme_ipa.svg';
import TextIcon from '../assets/svg/text-mode.svg';
import TextActiveIcon from '../assets/svg/text-mode-active.svg';
import PictureIcon from '../assets/svg/picture.svg';
import PictureActiveIcon from '../assets/svg/picture-active.svg';

import {color} from '../components/style/colors';
import {CurriculumArraySet} from '../data/CurriculumArraySet';
import {PhonemeArray} from '../data/PhonemeArray';
import {VPA_Array} from '../data/VPA_Array';
import {DictionaryArray} from '../data/DictionaryArray';
// import { videoList } from './VideoNameList';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {imageList} from './ImageNameList';
import {constant} from '../components/constant/constants';
// import { useOrientation } from './useOrientation';
import {videoList} from './VideoNameList';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import RNFetchBlob from 'react-native-blob-util';
import Record from '../assets/svg/record.svg';
import Record_Active from '../assets/svg/record-active.svg';
import Record_Blue from '../assets/svg/record-blue.svg';
import Listen_Active from '../assets/svg/listen-active.svg';
import Listen from '../assets/svg/listen.svg';
import Delete_Active from '../assets/svg/delete-active.svg';
import Delete from '../assets/svg/delete.svg';
import Send_Recording_Active from '../assets/svg/send recording-active.svg';
import Send_Recording from '../assets/svg/send recording.svg';

import {
  FFmpegKit,
  FFmpegCommand,
  FFmpegKitConfig,
  ReturnCode,
} from 'ffmpeg-kit-react-native';

import FFmpeg from 'ffmpeg-kit-react-native';
import {Level} from 'ffmpeg-kit-react-native';

const audioRecorderPlayer = new AudioRecorderPlayer();

const DEVICE_WIDTH = Dimensions.get('window').width;
const DEVICE_HEIGHT = Dimensions.get('window').height;

console.log('height ', DEVICE_HEIGHT, ' and the width is ', DEVICE_WIDTH);

function MainScreen() {
  // const orientation = useOrientation();
  // console.log('THIS IS ORIENTATION ', orientation)

  //loading
  const [loading, setLoading] = useState(true);

  //all value used for the lesson intro
  //data set for the menu | lesson list |
  const [curriculumArrayDataSet, setCurriculumArrayDataSet] = useState([]);
  //selected lession values
  const [selectedValue, setSelectedValue] = useState([]);
  //to check if selected is lesson is lesson intro
  const [lessonInro, setLessonIntro] = useState(true);

  //to track the cuurent active tab in the app
  const [activeTab, setActiveTab] = useState('video');
  //to track the current phoneme type
  const [phoneme, setPhoneme] = useState('latin');

  //bottom words list with all the data
  const [wordsList, setWordsList] = useState([]);
  const [alphaWords, setAlphWords] = useState([]);
  const [latinWords, setLatinWords] = useState([]);
  const [ipaWords, setIpaWords] = useState([]);
  //to track the current word
  const [wordIndex, setWordIndex] = useState(0);
  //to track the current character
  const [pointer, setPointer] = useState(-1);

  //for the text info of phonemes
  const [phonemeTexts, setPhonemeTexts] = useState([]);
  const [playButtonsIndex, setPlayButtonsIndex] = useState(0);
  //for the images of the word
  const [imageWords, setImageWords] = useState('');
  //for the dictionary text of word
  const [dictionaryWords, setDictionaryWords] = useState([]);

  // for the video posters
  // const [posterImg, setPosterImg] = useState(require('../assets/images/simone_front_view.png'))
  // const [sideposterImg, setSidePosterImg] = useState(require('../assets/images/simone_side_view.png'))

  //for the video controls
  const [slow, setSlow] = useState(false);
  const [front, setFront] = useState(true);
  const [play, setPlay] = useState(false);

  const [preventState, setPreventState] = useState({next: true});
  const [selectedWordRecord, setSelectedWordRecord] = useState({});
  const [upperCasePhoneme, setUpperCasePhoneme] = useState(true);

  // currently recording start or not.
  const [isRecording, setRecording] = useState('');

  // Recording temp paths
  const dirs = RNFetchBlob.fs.dirs;

  const path = Platform.select({
    android: `${dirs.DownloadDir}/${new Date().getTime()}SAUNDZ.mp3`,
    ios: `file://${dirs.DocumentDir}/${new Date().getTime()}SAUNDZ.m4a`,
  });

  console.log('path1 ===> 1', path);

  const [recordingDataArr, setRecordingDataArr] = useState([]);

  const never_ask_againText = 'never_ask_again';

  useEffect(() => {
    console.log('lessonInro ==> ', lessonInro);
    getRecordingDataFromLocal();
    const subscription = AppState.addEventListener('change', nextAppState => {
      // console.log('THIS IS CURRENT ', AppState.currentState);
      if (AppState.currentState == 'active') {
        this.player && this.player.seek(0);
        setPlay(true);
      }
    });
    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    let currentSelectedWordRecords = recordingDataArr?.filter(
      el =>
        el?.title ===
        `${selectedValue?.lesson_num}_${wordsList[wordIndex]?.replace(
          ' ',
          '',
        )}`,
    );
    setPlayButtonsIndex(0);
    console.log(
      'currentSelectedWordRecords ==> ',

      currentSelectedWordRecords?.[0] || {},
      `${selectedValue?.lesson_num}_${wordsList[wordIndex]?.replace(' ', '')}`,
      wordsList[wordIndex],
      wordsList[wordIndex]?.replace(' ', ''),
    );

    setSelectedWordRecord(currentSelectedWordRecords?.[0] || {});
  }, [recordingDataArr, selectedValue, wordIndex, wordsList]);

  const getRecordingDataFromLocal = async () => {
    let localRecordingData = await AsyncStorage.getItem('RECORDED_DATA');

    console.log('localRecordingData ==> ', localRecordingData);
    let parseDataArr =
      localRecordingData !== null ? JSON.parse(localRecordingData) : [];
    console.log('parseDataArr ===> ', parseDataArr);
    setRecordingDataArr(parseDataArr);
  };

  useEffect(() => {
    (async () => {
      await buildLessonList();
    })();
  }, []);

  //get initial saved data
  const onLoadData = async temp => {
    AsyncStorage.getItem('saveData').then(async value => {
      let saveData = JSON.parse(value);
      // console.log('SAVED DATA ', saveData)
      if (saveData != null) {
        if (saveData.selectedValue.lesson_item_num == 1) {
          // console.log('FROM INTRO ', saveData.selectedValue)
          await setSelectedValue(saveData.selectedValue);
          setLessonIntro(true);
          setLoading(false);
        } else {
          await setSelectedValue(saveData.selectedValue);

          setLessonIntro(false);
          //find all the words data form the current lesson
          const item = CurriculumArraySet.filter(
            obj => obj.lesson_num == saveData.selectedValue.lesson_num,
          );
          const words = decodeURI(
            item.filter(obj => obj.lesson_item_num == 6)[0].data.trim(''),
          ).split(',');

          await setWordsList(words);
          // console.log("WORDS ", words)
          const latinWords = decodeURI(
            item.filter(obj => obj.lesson_item_num == 7)[0].data.trim(''),
          ).split(',');
          setLatinWords(latinWords);
          // console.log("LATIN WORDS ", latinWords)
          const alphaWords = decodeURI(
            item.filter(obj => obj.lesson_item_num == 8)[0].data.trim(''),
          ).split('|');
          setAlphWords(alphaWords);
          // console.log("ALPHA WORDS ", alphaWords)
          const ipaWords = decodeURI(
            item.filter(obj => obj.lesson_item_num == 9)[0].data,
          ).split('|');
          setIpaWords(ipaWords);
          // console.log("IPA WORDS ", ipaWords)

          await setWordIndex(saveData.wordIndex);
          await setPointer(saveData.pointer);

          // need to update text for the word
          getTextOfCurrentWord(alphaWords[saveData.wordIndex]);

          getDictionaryOfCurrentWord(words[saveData.wordIndex]);
          getImageOfCurrentWord(words[saveData.wordIndex]);

          await setLoading(false);
        }
      } else {
        await setSelectedValue(temp);
        await currentLession(temp);
        await setLoading(false);
      }
    });
  };
  // get the saved word type and tab from 5
  const onLoadTypeAndTab = () => {
    AsyncStorage.getItem('tabData').then(async value => {
      const tabData = JSON.parse(value);
      // console.log(tabData)
      if (tabData != null) {
        setActiveTab(tabData.activeTab);
        setPhoneme(tabData.phoneme);
      }
    });
  };

  // create the array of the lession list
  const buildLessonList = async () => {
    let s = '';
    let t = '';
    let temp = [];
    for (var i = 0; i < CurriculumArraySet.length; i++) {
      if (CurriculumArraySet[i].lesson_item_num == 0) {
        // chapter
        // console.log(t)
        t = decodeURI(CurriculumArraySet[i].data);
      }
      if (CurriculumArraySet[i].lesson_item_num == 1) {
        s = CurriculumArraySet[i].data.toString();
        if (t != '') {
          t = s + ' ' + t;
          // this.lessons.push(t);
          temp.push({
            data: t,
            lesson_num: CurriculumArraySet[i].lesson_num,
            lesson_item_num: CurriculumArraySet[i].lesson_item_num,
            id: CurriculumArraySet[i].id,
          });
          t = '';
        }
      }
      if (CurriculumArraySet[i].lesson_item_num == 2) {
        s = s + ' ' + decodeURI(CurriculumArraySet[i].data);
        // this.lessons.push(s);
        temp.push({
          data: s,
          lesson_num: CurriculumArraySet[i].lesson_num,
          lesson_item_num: CurriculumArraySet[i].lesson_item_num,
          id: CurriculumArraySet[i].id,
        });
      }
    }

    await setCurriculumArrayDataSet(temp);
    await onLoadData(temp[0]);
    await onLoadTypeAndTab();
  };

  //return the current lesson and it's data
  const currentLession = async lesson => {
    if (lesson.lesson_item_num == 1) {
      console.log('FROM INTRO cuurent lession  ', lesson);
      setPointer(-1);
      setWordIndex(0);
      setLessonIntro(true);
      setLoading(false);
    } else {
      setLessonIntro(false);

      //find all the words data form the current lesson
      const item = CurriculumArraySet.filter(
        obj => obj.lesson_num == lesson.lesson_num,
      );
      const words = decodeURI(
        item.filter(obj => obj.lesson_item_num == 6)[0].data.trim(''),
      ).split(',');

      await setPointer(-1);
      await setWordIndex(0);
      await setWordsList(words);

      console.log('WORDS ', words);
      const latinWords = decodeURI(
        item.filter(obj => obj.lesson_item_num == 7)[0].data.trim(''),
      ).split(',');
      setLatinWords(latinWords);
      console.log('LATIN WORDS ', latinWords);
      const alphaWords = decodeURI(
        item.filter(obj => obj.lesson_item_num == 8)[0].data.trim(''),
      ).split('|');
      setAlphWords(alphaWords);
      console.log('ALPHA WORDS ', alphaWords);
      const ipaWords = decodeURI(
        item.filter(obj => obj.lesson_item_num == 9)[0].data,
      ).split('|');
      setIpaWords(ipaWords);
      console.log('IPA WORDS ', ipaWords);

      // need to update text for the word
      getTextOfCurrentWord(alphaWords[0]);
      getDictionaryOfCurrentWord(words[0]);
      getImageOfCurrentWord(words[0]);

      setLoading(false);
    }
  };

  //function call when user change index from the menu
  const onChangeLessionFromMenu = async item => {
    await setLoading(true);
    await currentLession(item);
    await setPreventState({next: true});
    AsyncStorage.setItem(
      'saveData',
      JSON.stringify({pointer: -1, wordIndex: 0, selectedValue: item}),
    );
  };

  //next button press from the lession intro screen and after the last word
  const nextFromLessonIntro = async () => {
    const index = curriculumArrayDataSet.findIndex(
      obj => obj.id == selectedValue.id,
    );
    if (index == curriculumArrayDataSet.length - 1) {
      setPreventState({next: false});
      AsyncStorage.setItem(
        'saveData',
        JSON.stringify({
          pointer: pointer,
          wordIndex: wordIndex,
          selectedValue: selectedValue,
        }),
      );
    } else {
      // setPreventState({ next: true })
      AsyncStorage.setItem(
        'saveData',
        JSON.stringify({
          pointer: -1,
          wordIndex: 0,
          selectedValue: curriculumArrayDataSet[index + 1],
        }),
      );
      await setLoading(true);
      await setPointer(-1);
      await setWordIndex(0);
      await setSelectedValue(curriculumArrayDataSet[index + 1]);
      await currentLession(curriculumArrayDataSet[index + 1]);
    }
  };

  //previous button press from the lession screen after the first word
  const previousFromLesson = async () => {
    // setPreventState({ next: true })
    const index = curriculumArrayDataSet.findIndex(
      obj => obj.id == selectedValue.id,
    );
    AsyncStorage.setItem(
      'saveData',
      JSON.stringify({
        pointer: pointer,
        wordIndex: wordIndex,
        selectedValue: curriculumArrayDataSet[index - 1],
      }),
    );
    await setSelectedValue(curriculumArrayDataSet[index - 1]);
    await currentLession(curriculumArrayDataSet[index - 1]);
  };

  // next button press
  const onNextPress = async () => {
    if (pointer == -1) {
      //go to first character
      AsyncStorage.setItem(
        'saveData',
        JSON.stringify({
          pointer: pointer + 1,
          wordIndex: wordIndex,
          selectedValue: selectedValue,
        }),
      );
      await setPointer(pointer + 1);
    } else {
      if (pointer + 1 < ipaWords[wordIndex].split(',').length) {
        //go to next character
        AsyncStorage.setItem(
          'saveData',
          JSON.stringify({
            pointer: pointer + 1,
            wordIndex: wordIndex,
            selectedValue: selectedValue,
          }),
        );
        setPointer(pointer + 1);
      } else {
        if (wordIndex + 1 == wordsList.length) {
          console.log('NEXT LESSON CALLL');
          nextFromLessonIntro();
        } else {
          //go to next word
          AsyncStorage.setItem(
            'saveData',
            JSON.stringify({
              pointer: -1,
              wordIndex: wordIndex + 1,
              selectedValue: selectedValue,
            }),
          );

          await setPointer(-1);
          await setWordIndex(wordIndex + 1);
          //need to update the next word text
          getTextOfCurrentWord(alphaWords[wordIndex + 1]);
          getDictionaryOfCurrentWord(wordsList[wordIndex + 1]);
          getImageOfCurrentWord(wordsList[wordIndex + 1]);
        }
      }
    }
  };
  //previous button press
  const onPreviousPress = async () => {
    if (wordIndex == 0) {
      previousFromLesson();
    } else {
      AsyncStorage.setItem(
        'saveData',
        JSON.stringify({
          pointer: -1,
          wordIndex: wordIndex - 1,
          selectedValue: selectedValue,
        }),
      );
      await setPointer(-1);
      await setWordIndex(wordIndex - 1);
      getTextOfCurrentWord(alphaWords[wordIndex - 1]);
      getDictionaryOfCurrentWord(wordsList[wordIndex - 1]);
      getImageOfCurrentWord(wordsList[wordIndex - 1]);
    }
    setPreventState({next: true});
  };

  //text change function logic goes here
  const getTextOfCurrentWord = async alphaword => {
    const data = await alphaword.split(',');
    // console.log('THIS IS GET TEXT CURRENT WORD ', data)
    let phonemeTexts = '';
    for (var i = 0; i < data.length; i++) {
      const newData = VPA_Array.filter(obj => {
        return obj.id == data[i].trim('');
      });
      if (newData != '') {
        phonemeTexts = phonemeTexts + decodeURI(newData[0].text) + '\n\n';
        // console.log(newData)
      }
    }
    setPhonemeTexts(phonemeTexts);
  };

  //dictionary change function logic goes here
  const getDictionaryOfCurrentWord = wordslists => {
    const data = DictionaryArray.filter(obj => {
      return obj.word == wordslists.trim('');
    });
    // console.log(data)
    setDictionaryWords(data);
  };

  const getImageOfCurrentWord = wordslists => {
    // console.log('THIS IS WORD', wordslists)
    const imageData = imageList.filter(
      obj => obj.name == `word_${wordslists.trim('')}.jpg`,
    );
    // console.log(imageData)
    if (imageData == '') {
      return require('../../android/saundz_asset_pack/src/main/assets/dictionary_jpg/word_ABOUT.jpg');
    } else {
      return imageData[0].image;
    }
  };

  const getPosterImage = value => {
    if (value) {
      return Image.resolveAssetSource(
        require('../assets/images/simone_front_view.png'),
      ).uri;
    } else {
      return Image.resolveAssetSource(
        require('../assets/images/simone_front_view.png'),
      ).uri;
    }
  };

  const getFrontVideo = () => {
    if (wordsList[wordIndex]) {
      // console.log(' VIDEO FRONT ', wordsList[wordIndex])
      if (pointer == -1) {
        const front_word_string = `word_${wordsList[wordIndex]
          .toLowerCase()
          .trim('')}_front.m4v`;

        console.log(' VIDEO FRONT ', front_word_string);
        const frontVideoData = videoList.filter(
          obj => obj.name == front_word_string,
        );
        console.log('WORD VIDEO FRONT ', frontVideoData);

        if (frontVideoData == '') {
          // return require('../assets/video/words_m4v/word_huh_front.m4v')
          return require('../../android/saundz_asset_pack/src/main/assets/video/words_m4v/word_huh_front.m4v');
        } else {
          // return JSON.parse(newData[0]).video
          return frontVideoData[0].video;
        }
      } else {
        const front_phoneme_string = `phoneme_${alphaWords[wordIndex]
          .split(',')
          [pointer].trim('')}_front.m4v`;
        // console.log('PHONEME VIDEO FRONT ', front_phoneme_string)
        const frontVideoData = videoList.filter(
          obj => obj.name == front_phoneme_string,
        );
        // console.log('WORD VIDEO FRONT ', frontVideoData)
        if (frontVideoData == '') {
          // return require('../assets/video/words_m4v/word_huh_front.m4v')
          return require('../../android/saundz_asset_pack/src/main/assets/video/words_m4v/word_huh_front.m4v');
        } else {
          return frontVideoData[0].video;
        }
      }
    } else {
      // return require('../assets/video/words_m4v/word_huh_front.m4v')
      return require('../../android/saundz_asset_pack/src/main/assets/video/words_m4v/word_huh_front.m4v');
    }
  };

  // const getCurrentAudio = () => {
  //   if (wordsList[wordIndex]) {
  //     if (pointer == -1) {
  //       const side_word_string = `word_${wordsList[wordIndex]
  //         .toLowerCase()
  //         .trim('')}.mp3`;

  //       const sideVideoData = videoList.filter(
  //         obj => obj.name == side_word_string,
  //       );
  //       console.log('WORD VIDEO SIDE ', sideVideoData);
  //       if (sideVideoData == '') {
  //         return require('../../android/saundz_asset_pack/src/main/assets/audio/words_mp3/word_huh.mp3');
  //       } else {
  //         return sideVideoData[0].audio;
  //       }
  //     } else {
  //       const side_phoneme_string = `phoneme_${alphaWords[wordIndex]
  //         .split(',')
  //         [pointer].trim('')}.mp3`;

  //       const sideVideoData = videoList.filter(
  //         obj => obj.name == side_phoneme_string,
  //       );
  //       // console.log('WORD VIDEO SIDE ', sideVideoData)
  //       if (sideVideoData == '') {
  //         return require('../../android/saundz_asset_pack/src/main/assets/audio/words_mp3/word_huh.mp3');
  //       } else {
  //         return sideVideoData[0].audio;
  //       }
  //     }
  //   } else {
  //     return require('../../android/saundz_asset_pack/src/main/assets/audio/words_mp3/word_huh.mp3');
  //   }
  // };

  const getSideVideo = () => {
    if (wordsList[wordIndex]) {
      if (pointer == -1) {
        const side_word_string = `word_${wordsList[wordIndex]
          .toLowerCase()
          .trim('')}_side.m4v`;
        // console.log(' VIDEO SIDE ', side_word_string)
        const sideVideoData = videoList.filter(
          obj => obj.name == side_word_string,
        );
        console.log('WORD VIDEO SIDE ', sideVideoData);
        if (sideVideoData == '') {
          // return require('../assets/video/words_m4v/word_huh_side.m4v')
          return require('../../android/saundz_asset_pack/src/main/assets/video/words_m4v/word_huh_side.m4v');
        } else {
          return sideVideoData[0].video;
        }
      } else {
        const side_phoneme_string = `phoneme_${alphaWords[wordIndex]
          .split(',')
          [pointer].trim('')}_side.m4v`;
        // console.log('PHONEME VIDEO SIDE ', side_phoneme_string)
        const sideVideoData = videoList.filter(
          obj => obj.name == side_phoneme_string,
        );
        // console.log('WORD VIDEO SIDE ', sideVideoData)
        if (sideVideoData == '') {
          // return require('../assets/video/words_m4v/word_huh_side.m4v')
          return require('../../android/saundz_asset_pack/src/main/assets/video/words_m4v/word_huh_side.m4v');
        } else {
          return sideVideoData[0].video;
        }
      }
    } else {
      // return require('../assets/video/words_m4v/word_huh_side.m4v')
      return require('../../android/saundz_asset_pack/src/main/assets/video/words_m4v/word_huh_side.m4v');
    }
  };

  // get the IPA word from phoneme array
  const getIpaWord = item => {
    // console.log(item)
    let str = item.trim('');

    let silent = 0;
    let stress = 0;
    let syllable = 0;

    if (str.includes('#')) {
      str = str.replace('#', '');
    }
    if (str.includes('!')) {
      stress = 1;
      str = str.replace('!', '');
    }
    if (str.includes('1')) {
      syllable = 1;
      str = str.replace('1', '');
    }
    if (str.includes('2')) {
      syllable = 2;
      str = str.replace('2', '');
    }
    if (str.includes('3')) {
      syllable = 3;
      str = str.replace('3', '');
    }
    if (str.includes('4')) {
      syllable = 4;
      str = str.replace('4', '');
    }

    const data = PhonemeArray.filter(obj => {
      return obj.id == str;
    });
    if (data != '') {
      console.log(data[0]?.text);
      if (
        data[0]?.text.toLowerCase() == 'ɪ' ||
        data[0]?.text.toLowerCase() == 'ɑ'
      ) {
        if (Platform.OS == 'ios' && upperCasePhoneme) {
          return data[0]?.text.toUpperCase();
        } else {
          if (upperCasePhoneme) {
            return <Text style={{fontSize: 23}}>{data[0]?.text}</Text>;
          } else {
            return data[0]?.text;
          }
        }
      } else {
        if (upperCasePhoneme) {
          return data[0]?.text.toUpperCase();
        } else {
          return data[0]?.text;
        }
      }
      // return (data[0]?.text == 'i' || data[0]?.text == 'ɑ' ? data[0]?.text : data[0]?.text)
    } else {
      if (upperCasePhoneme) {
        return str.toUpperCase();
      } else {
        return str;
      }
    }
  };

  const getBottomActiveWord = (item, parentIndex) => {
    const items = ipaWords[wordIndex].split(',');
    // console.log(items)

    let syllabus = [];
    let stress = [];

    for (var i = 0; i < items.length; i++) {
      if (items[i].search('!') != -1) {
        if (stress.findIndex(obj => obj.id == 1) != -1) {
        } else {
          stress.push({id: 1, index: i});
        }
      }

      if (items[i].search('1') != -1) {
        if (syllabus.findIndex(obj => obj.id == 1) != -1) {
        } else {
          // syllabus.push({ id: 1, index: i })
        }
      } else if (items[i].search('2') != -1) {
        if (syllabus.findIndex(obj => obj.id == 2) != -1) {
        } else {
          syllabus.push({id: 2, index: i});
        }
      } else if (items[i].search('3') != -1) {
        if (syllabus.findIndex(obj => obj.id == 3) != -1) {
        } else {
          syllabus.push({id: 3, index: i});
        }
      } else if (items[i].search('4') != -1) {
        if (syllabus.findIndex(obj => obj.id == 4) != -1) {
        } else {
          syllabus.push({id: 4, index: i});
        }
      }
    }

    return (
      <>
        {latinWords[wordIndex]?.split('~').map((item, index) => {
          return (
            <Text key={index}>
              {syllabus.findIndex(obj => obj.index == index) != -1 ? (
                stress.findIndex(obj => obj.index == index) != -1 ? (
                  <Text>
                    {"·'"}
                    <Text
                      style={[
                        styles.bottomWordsText,
                        {
                          color: index == pointer ? color.blue : color.black,
                          textDecorationLine:
                            index == pointer ? 'underline' : null,
                        },
                      ]}>
                      {item.trim('')}
                    </Text>
                  </Text>
                ) : (
                  <Text>
                    {'·'}
                    <Text
                      style={[
                        styles.bottomWordsText,
                        {
                          color: index == pointer ? color.blue : color.black,
                          textDecorationLine:
                            index == pointer ? 'underline' : null,
                        },
                      ]}>
                      {item.trim('')}
                    </Text>
                  </Text>
                )
              ) : stress.findIndex(obj => obj.index == index) != -1 ? (
                <Text>
                  {"'"}
                  <Text
                    style={[
                      styles.bottomWordsText,
                      {
                        color: index == pointer ? color.blue : color.black,
                        textDecorationLine:
                          index == pointer ? 'underline' : null,
                      },
                    ]}>
                    {item.trim('')}
                  </Text>
                </Text>
              ) : (
                <Text
                  style={[
                    styles.bottomWordsText,
                    {
                      color: index == pointer ? color.blue : color.black,
                      textDecorationLine: index == pointer ? 'underline' : null,
                    },
                  ]}>
                  {item.trim('')}
                </Text>
              )}
            </Text>
          );
        })}
      </>
    );
  };

  const [isPlaying, setIsPlaying] = useState(false);

  const startPlaying = async recordIndex => {
    const audioPath = true
      ? '../assets/simone/phoneme_aa.mp3'
      : selectedWordRecord?.[`record${recordIndex}`]?.url;

    try {
      console.log('Playback started');
      setIsPlaying(true);
      await audioRecorderPlayer.startPlayer(audioPath);

      audioRecorderPlayer.addPlayBackListener(e => {
        console.log('addPlayBackListener ===> ', e);
        if (e.currentPosition === e.duration) {
          stopPlaying();
        }

        return;
      });
    } catch (error) {
      console.log('Error starting playback:', error);
    }
  };

  const stopPlaying = async () => {
    try {
      await audioRecorderPlayer.stopPlayer();
      setIsPlaying(false);
      console.log('Playback stopped');
    } catch (error) {
      console.log('Error stopping playback:', error);
    }
  };

  const onStartRecord = async recordIndex => {
    audioRecorderPlayer.stopPlayer();
    audioRecorderPlayer.removePlayBackListener();
    if (Platform.OS === 'android') {
      try {
        const grants = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        ]);

        console.log('write external stroage', grants);

        if (
          grants['android.permission.WRITE_EXTERNAL_STORAGE'] ===
            PermissionsAndroid.RESULTS.GRANTED &&
          grants['android.permission.READ_EXTERNAL_STORAGE'] ===
            PermissionsAndroid.RESULTS.GRANTED &&
          grants['android.permission.RECORD_AUDIO'] ===
            PermissionsAndroid.RESULTS.GRANTED
        ) {
          audioRecording(recordIndex);
        } else {
          console.log('All required permissions not granted');
          if (
            grants['android.permission.RECORD_AUDIO'] === never_ask_againText ||
            grants['android.permission.WRITE_EXTERNAL_STORAGE'] ===
              never_ask_againText ||
            grants['android.permission.READ_EXTERNAL_STORAGE'] ===
              never_ask_againText
          ) {
            Linking.openSettings();
          }
          return;
        }
      } catch (err) {
        console.warn(err);
        return;
      }
    } else {
      audioRecording(recordIndex);
    }
  };

  const audioRecording = async recordIndex => {
    try {
      console.log('path ==111 > ', path);
      await audioRecorderPlayer.startRecorder(path);
      setRecording(recordIndex);

      console.log('Recording started');
    } catch (error) {
      console.log(
        'Error starting recording:',
        error,
        error?.response,
        error?.message,
      );
    }
  };

  const onStopRecord = async recordIndex => {
    try {
      const result = await audioRecorderPlayer.stopRecorder();
      setRecording('');
      console.log('Recording stopped:', result);

      console.log(
        '`${selectedValue?.lesson_num}_${wordsList[wordIndex]?.replace ===> 11111 ',
        `${selectedValue?.lesson_num}_${wordsList[wordIndex]?.replace(
          ' ',
          '',
        )}`,
      );

      let customDataArr = [];

      if (recordingDataArr?.length > 0) {
        let isDataAlreadyStored = recordingDataArr?.filter(
          el =>
            el?.title ===
            `${selectedValue?.lesson_num}_${wordsList[wordIndex]?.replace(
              ' ',
              '',
            )}`,
        );
        if (isDataAlreadyStored?.length > 0) {
          customDataArr = recordingDataArr?.map(el =>
            el?.title ===
            `${selectedValue?.lesson_num}_${wordsList[wordIndex]?.replace(
              ' ',
              '',
            )}`
              ? {...el, [`record${recordIndex}`]: {url: result}}
              : el,
          );
        } else {
          customDataArr = [
            ...recordingDataArr,
            {
              title: `${selectedValue?.lesson_num}_${wordsList[
                wordIndex
              ]?.replace(' ', '')}`,
              [`record${recordIndex}`]: {url: result},
            },
          ];
        }
      } else {
        customDataArr = [
          {
            title: `${selectedValue?.lesson_num}_${wordsList[
              wordIndex
            ]?.replace(' ', '')}`,
            [`record${recordIndex}`]: {url: result},
          },
        ];
      }

      console.log('RecordingDataArr ===> stoped ==> ', customDataArr);
      setRecordingDataArr(customDataArr);
      AsyncStorage.setItem('RECORDED_DATA', JSON.stringify(customDataArr));
    } catch (error) {
      console.log('Error stopping recording:', error);
    }
  };

  const onPressRecordButton = recordIndex => {
    console.log('recordIndex ====> ', recordIndex);
    setPlayButtonsIndex(0);

    console.log('isRecording === empty ==> ', isRecording, isRecording === '');
    if (isRecording === '') {
      onStartRecord(recordIndex);
    } else {
      onStopRecord(recordIndex);
    }
  };

  const onPlayPausePress = recordIndex => {
    if (isPlaying) {
      stopPlaying(recordIndex);
    } else {
      startPlaying(recordIndex);
    }
  };

  const onRemoveRecording = recordIndex => {
    let customDataArr = recordingDataArr?.map(el =>
      el?.title ===
      `${selectedValue?.lesson_num}_${wordsList[wordIndex]?.replace(' ', '')}`
        ? {...el, [`record${recordIndex}`]: {url: ''}}
        : el,
    );

    setRecordingDataArr(customDataArr);
    setPlayButtonsIndex(0);
    console.log('RecordingDataArr ===> ', customDataArr);

    AsyncStorage.setItem('RECORDED_DATA', JSON.stringify(customDataArr));
  };

  const RecordButton = ({defaultIndexNumber}) => {
    let currentRecord =
      selectedWordRecord?.[`record${defaultIndexNumber}`] || false;
    console.log('currentRecord ===> 111', currentRecord);
    return (
      <View>
        {playButtonsIndex === defaultIndexNumber ? (
          <View style={{flexDirection: 'row'}}>
            <TouchableOpacity
              style={{height: 60, aspectRatio: 1}}
              onPress={() => onPlayPausePress(defaultIndexNumber)}>
              {!isPlaying ? (
                <Listen height={'100%'} width={'100%'} />
              ) : (
                <Listen_Active height={'100%'} width={'100%'} />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                height: 60,
                aspectRatio: 1,
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onPress={() => {
                playMergeAudioFiles(
                  selectedWordRecord?.[`record${defaultIndexNumber}`]?.url,
                  defaultIndexNumber,
                );
              }}>
              <Image
                source={require('../assets/svg/merge-listen.png')}
                style={{height: '60%', aspectRatio: 1, resizeMode: 'contain'}}
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                onTrimAudioClip(
                  selectedWordRecord?.[`record${defaultIndexNumber}`]?.url,
                  defaultIndexNumber,
                );
              }}
              style={{height: 60, aspectRatio: 1}}>
              {true ? (
                <Send_Recording height={'100%'} width={'100%'} />
              ) : (
                <Send_Recording_Active height={'100%'} width={'100%'} />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={{height: 60, aspectRatio: 1}}
              onPress={() => onRemoveRecording(defaultIndexNumber)}>
              {true ? (
                <Delete height={'100%'} width={'100%'} />
              ) : (
                <Delete_Active height={'100%'} width={'100%'} />
              )}
            </TouchableOpacity>
          </View>
        ) : selectedWordRecord?.[`record${defaultIndexNumber}`]?.url ? (
          <TouchableOpacity
            onPress={() => {
              setPlayButtonsIndex(defaultIndexNumber);
            }}>
            <Record_Blue height={60} width={60} />
          </TouchableOpacity>
        ) : isRecording === defaultIndexNumber ? (
          <TouchableOpacity
            onPress={() => onPressRecordButton(defaultIndexNumber)}>
            <Record_Active height={60} width={60} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={() => onPressRecordButton(defaultIndexNumber)}>
            <Record height={60} width={60} />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const playMergeAudioFiles = async (inputFilePath, defaultIndexNumber) => {
    audioRecorderPlayer.stopPlayer();
    audioRecorderPlayer.removePlayBackListener();

    const leftAudioPath = inputFilePath;
    const rightAudioPath = '../assets/simone/phoneme_aa.mp3';
    let outputPath = path;

    console.log('outputFilePath  ===> ', outputPath);
    const command = `-i ${leftAudioPath} -i ${rightAudioPath} -filter_complex "[0:a][1:a]amerge=inputs=2[aout]" -map "[aout]" -ac 2 ${outputPath}`;

    FFmpegKitConfig.enableLogCallback(log => {
      console.log(log.getMessage());
    });

    try {
      await FFmpegKit.executeAsync(command);
      onTrimSuccess(defaultIndexNumber, outputPath);
      console.log('Command execution completed successfully.');
    } catch (e) {
      console.log(
        `Command execution failed with rc=${e.rc}, commandOutput=${
          e.commandOutput
        }, causedBy=${e.getCausedBy()}, failStackTrace=${e.getFailStackTrace()}`,
      );
    }
  };

  const onTrimAudioClip = async (inputFilePath, defaultIndexNumber) => {
    const outputFilePath = path;

    // let startThreshold =Platform?.OS === 'android' ?'-50db' : '-40db'
    const command1 = `-i ${inputFilePath} -af "silenceremove=start_periods=1:start_duration=1:start_threshold=-50dB:detection=peak,aformat=dblp,areverse,silenceremove=start_periods=1:start_duration=1:start_threshold=-50dB:detection=peak,aformat=dblp,areverse" ${outputFilePath}`;

    try {
      await FFmpegKit.executeAsync(command1);
      onTrimSuccess(defaultIndexNumber, outputFilePath);
      console.log('Command execution completed successfully.');
    } catch (e) {
      console.log(
        `Command execution failed with rc=${e.rc}, commandOutput=${
          e.commandOutput
        }, causedBy=${e.getCausedBy()}, failStackTrace=${e.getFailStackTrace()}`,
      );
    }
  };

  const onTrimSuccess = (defaultIndexNumber, outputFilePath) => {
    let trimedRecordDataArr = recordingDataArr?.map(el =>
      el?.title ===
      `${selectedValue?.lesson_num}_${wordsList[wordIndex]?.replace(' ', '')}`
        ? {...el, [`record${defaultIndexNumber}`]: {url: outputFilePath}}
        : el,
    );

    setRecordingDataArr(trimedRecordDataArr);
    AsyncStorage.setItem('RECORDED_DATA', JSON.stringify(trimedRecordDataArr));
  };

  return (
    <>
      {loading ? (
        <View style={[styles.container, {justifyContent: 'center'}]}>
          <ActivityIndicator color={color.black} size={35} />
        </View>
      ) : (
        <View style={styles.container}>
          <LessionsList
            selectedValue={selectedValue}
            setSelectedValue={setSelectedValue}
            data={curriculumArrayDataSet}
            onChangeLession={index => onChangeLessionFromMenu(index)}
          />
          {lessonInro ? (
            <>
              {/* <View style={styles.mainContainer}>
                <Text style={styles.headingText}>{'Lesson Introduction'}</Text>
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  style={{height: DEVICE_HEIGHT / 1.55}}>
                  <Text
                    style={[
                      styles.subText,
                      {
                        fontSize:
                          constant.DEVICE_HEIGHT > constant.TABLET_HEIGHT
                            ? constant.SUB_TEXT_BIG
                            : constant.SUB_TEXT_SMALL,
                        marginTop: 0,
                      },
                    ]}>
                    {(selectedValue?.data).replace(/[0-9]/g, '')}
                  </Text>
                  <Text style={styles.subText}>
                    {decodeURI(
                      CurriculumArraySet.find(
                        o => o.id === selectedValue.id + 1,
                      ).data,
                    )}
                  </Text>
                </ScrollView>
                <View
                  style={{
                    alignItems: 'flex-end',
                    justifyContent: 'flex-end',
                    width: DEVICE_WIDTH / 1.1,
                    marginTop: DEVICE_HEIGHT / 30,
                  }}>
                  <TouchableOpacity
                    onPress={() => nextFromLessonIntro()}
                    style={styles.nextButton}>
                    <MaterialIcons
                      name="navigate-next"
                      color={color.white}
                      size={
                        constant.DEVICE_HEIGHT > constant.TABLET_HEIGHT
                          ? constant.NEXT_BIG
                          : constant.NEXT_SMALL
                      }
                    />
                  </TouchableOpacity>
                </View>
              </View> */}
            </>
          ) : (
            <>
              <View style={styles.videoContainer}>
                {activeTab == 'video' || activeTab == 'dictionary' ? (
                  <>
                    <Video
                      rate={slow ? 0.3 : 1}
                      resizeMode={
                        DEVICE_HEIGHT < 700
                          ? 'center'
                          : DEVICE_HEIGHT > constant.TABLET_HEIGHT
                          ? Platform.OS == 'ios'
                            ? 'center'
                            : 'stretch'
                          : 'stretch'
                      }
                      posterResizeMode={
                        DEVICE_HEIGHT < 700
                          ? 'center'
                          : DEVICE_HEIGHT > constant.TABLET_HEIGHT
                          ? Platform.OS == 'ios'
                            ? 'center'
                            : 'stretch'
                          : 'stretch'
                      }
                      // resizeMode={"center"}
                      // posterResizeMode={"center"}
                      // poster={front ? posterImg : sideposterImg}
                      // poster={getPosterImage(front)}
                      // poster={Image.resolveAssetSource(require('../assets/images/simone_front_view.png')).uri}

                      poster={'https://baconmockup.com/300/200/'}
                      paused={!play}
                      source={front ? getFrontVideo() : getSideVideo()}
                      ref={ref => {
                        this.player = ref;
                      }}
                      onError={error => {
                        console.log(error);
                      }}
                      onLoad={() => {
                        this.player && this.player.seek(0);
                        setPlay(true);
                      }}
                      onEnd={() => {
                        setPlay(false);
                      }}
                      style={[
                        styles.backgroundVideo,
                        {
                          borderWidth:
                            DEVICE_HEIGHT < 700
                              ? 0
                              : DEVICE_HEIGHT > constant.TABLET_HEIGHT
                              ? 0
                              : 0.7,
                          width:
                            DEVICE_HEIGHT < 700
                              ? '79.5%'
                              : DEVICE_HEIGHT > constant.TABLET_HEIGHT
                              ? DEVICE_HEIGHT / 2.13
                              : '99%',
                        },
                      ]}
                    />

                    <TouchableOpacity
                      onPress={() => setSlow(!slow)}
                      style={styles.speedIcon}>
                      {slow ? <SlowIcon /> : <FastIcon />}
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => {
                        setFront(!front);
                        this.player && this.player.seek(0);
                        setPlay(true);
                      }}
                      style={styles.faceIcon}>
                      {!front ? <FrontIcon /> : <SideIcon />}
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.playButton}
                      onPress={() => {
                        if (play) {
                        } else {
                          this.player && this.player.seek(0);
                          setPlay(true);
                        }
                      }}>
                      {!play ? (
                        <EvilIcons
                          size={
                            DEVICE_HEIGHT > constant.TABLET_HEIGHT
                              ? constant.PLAY_ICON_BIG
                              : constant.PLAY_ICON_SMALL
                          }
                          name={'play'}
                          color={color.black}
                        />
                      ) : (
                        <AntDesign size={24} name="pause" color={color.black} />
                      )}
                    </TouchableOpacity>
                  </>
                ) : activeTab == 'text' ? (
                  <View style={styles.backgroundVideo}>
                    <ScrollView style={styles.middleScrollview}>
                      <Text style={styles.phonemeTexts}>{phonemeTexts}</Text>
                    </ScrollView>
                  </View>
                ) : activeTab == 'picture' ? (
                  <View style={styles.backgroundVideo}>
                    <Image
                      resizeMode="contain"
                      style={styles.imageView}
                      source={getImageOfCurrentWord(wordsList[wordIndex])}
                      // source={{ uri: imageWords }}
                    />
                  </View>
                ) : null}

                {/* {for dictionary } */}

                {/* {
                  <View style={styles.backgroundVideo}>
                    <ScrollView style={styles.middleScrollview}>
                      <Text
                        style={[
                          styles.headingText,
                          {
                            marginLeft: DEVICE_WIDTH / 25,
                            marginBottom: 10,
                            marginTop: 5,
                          },
                        ]}>
                        {wordsList[wordIndex].trim('')}
                      </Text>
                      {dictionaryWords.map((item, index) => {
                        return (
                          <View key={index} style={{alignItems: 'center'}}>
                            <Text
                              style={[
                                styles.headingText,
                                {
                                  fontSize:
                                    DEVICE_HEIGHT > constant.TABLET_HEIGHT
                                      ? constant.SUB_TEXT_BIG
                                      : constant.SUB_TEXT_SMALL,
                                  width: DEVICE_WIDTH / 1.22,
                                  marginBottom:
                                    index > 0
                                      ? item.type ==
                                        dictionaryWords[index - 1].type
                                        ? 0
                                        : 10
                                      : 10,
                                  marginTop:
                                    index > 0
                                      ? item.type ==
                                        dictionaryWords[index - 1].type
                                        ? 0
                                        : 5
                                      : 5,
                                },
                              ]}>
                              {index > 0
                                ? item.type == dictionaryWords[index - 1].type
                                  ? null
                                  : item.type.toLowerCase()
                                : item.type.toLowerCase()}
                            </Text>
                            <Text
                              style={[
                                styles.subText,
                                {
                                  marginTop: 0,
                                  width: DEVICE_WIDTH / 1.27,
                                  color: color.gray,
                                  fontWeight: '400',
                                },
                              ]}>
                              {decodeURI(item.definition).toLowerCase()}
                            </Text>
                            <Text
                              style={[
                                styles.subText,
                                {
                                  marginTop: 10,
                                  width: DEVICE_WIDTH / 1.27,
                                  color: color.gray,
                                  fontWeight: '500',
                                  textDecorationLine: 'underline',
                                },
                              ]}>
                              {'Example '}
                            </Text>
                            <Text
                              style={[
                                styles.subText,
                                {
                                  marginTop: 10,
                                  width: DEVICE_WIDTH / 1.37,
                                  color: color.gray,
                                  fontWeight: '400',
                                },
                              ]}>
                              {decodeURI(item.example).toLowerCase()}
                            </Text>
                          </View>
                        );
                      })}
                    </ScrollView>
                  </View>
                } */}
              </View>
              <View>
                <View style={styles.middleView}>
                  <TouchableOpacity
                    onPress={() => {
                      setActiveTab('video');
                      AsyncStorage.setItem(
                        'tabData',
                        JSON.stringify({phoneme: 'alpha', activeTab: 'video'}),
                      );
                    }}
                    style={styles.bottomIcons}>
                    {activeTab == 'video' ? <VideoActiveIcon /> : <VideoIcon />}
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      setActiveTab('text');
                      AsyncStorage.setItem(
                        'tabData',
                        JSON.stringify({phoneme: 'alpha', activeTab: 'text'}),
                      );
                    }}
                    style={styles.bottomIcons}>
                    {activeTab == 'text' ? (
                      <LessionActiveIcon />
                    ) : (
                      <LessionIcon />
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      if (phoneme == 'ipa') {
                        setPhoneme('alpha');
                        AsyncStorage.setItem(
                          'tabData',
                          JSON.stringify({
                            phoneme: 'alpha',
                            activeTab: activeTab,
                          }),
                        );
                      } else if (phoneme == 'alpha') {
                        setPhoneme('latin');
                        AsyncStorage.setItem(
                          'tabData',
                          JSON.stringify({
                            phoneme: 'latin',
                            activeTab: activeTab,
                          }),
                        );
                      } else {
                        setPhoneme('ipa');
                        AsyncStorage.setItem(
                          'tabData',
                          JSON.stringify({
                            phoneme: 'ipa',
                            activeTab: activeTab,
                          }),
                        );
                      }
                    }}
                    style={styles.bottomIcons}>
                    {phoneme == 'ipa' ? (
                      <IpaIcon />
                    ) : phoneme == 'alpha' ? (
                      <AlphaIcon />
                    ) : (
                      <LatinIcon />
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      setActiveTab('picture');
                      AsyncStorage.setItem(
                        'tabData',
                        JSON.stringify({
                          phoneme: 'alpha',
                          activeTab: 'picture',
                        }),
                      );
                    }}
                    style={styles.bottomIcons}>
                    {activeTab == 'picture' ? (
                      <PictureActiveIcon />
                    ) : (
                      <PictureIcon />
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      setActiveTab('dictionary');
                      AsyncStorage.setItem(
                        'tabData',
                        JSON.stringify({
                          phoneme: 'alpha',
                          activeTab: 'dictionary',
                        }),
                      );
                    }}
                    style={styles.bottomIcons}>
                    {activeTab == 'dictionary' ? (
                      <TextActiveIcon />
                    ) : (
                      <TextIcon />
                    )}
                  </TouchableOpacity>
                </View>
                <Text
                  style={{
                    width: DEVICE_WIDTH,
                    textAlign: 'center',
                    fontSize: DEVICE_HEIGHT > constant.TABLET_HEIGHT ? 12 : 8,
                    marginTop: -7,
                    color: color.placeholder,
                  }}>
                  {phoneme.toLowerCase()}
                </Text>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginTop: 10,
                  }}>
                  <TouchableOpacity
                    onPress={() => {
                      onPreviousPress();
                    }}
                    style={styles.nextPreviousButton}>
                    <Image
                      source={require('../assets/images/previous_enable.png')}
                      style={styles.nextPreviousButton}
                    />
                  </TouchableOpacity>
                  <View
                    style={{
                      width: DEVICE_WIDTH / 1.4,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                    <TouchableOpacity
                      onPress={() => setUpperCasePhoneme(!upperCasePhoneme)}
                      style={{flexDirection: 'row', alignItems: 'center'}}>
                      {phoneme == 'ipa' ? (
                        <>
                          {ipaWords[wordIndex]
                            ?.split(',')
                            .map((item, index) => {
                              return (
                                <Text
                                  key={index}
                                  style={[
                                    styles.activeWordText,
                                    {
                                      color:
                                        index == pointer
                                          ? color.blue
                                          : color.black,
                                      textDecorationLine:
                                        index == pointer ? 'underline' : null,
                                    },
                                  ]}>
                                  {getIpaWord(item)}
                                </Text>
                              );
                            })}
                        </>
                      ) : phoneme == 'alpha' ? (
                        <>
                          {alphaWords[wordIndex]
                            ?.split(',')
                            .map((item, index) => {
                              return (
                                <Text
                                  key={index}
                                  style={[
                                    styles.activeWordText,
                                    {
                                      color:
                                        index == pointer
                                          ? color.blue
                                          : color.black,
                                      textDecorationLine:
                                        index == pointer ? 'underline' : null,
                                    },
                                  ]}>
                                  {upperCasePhoneme
                                    ? item.toUpperCase().trim('')
                                    : item.toLowerCase().trim('')}
                                </Text>
                              );
                            })}
                        </>
                      ) : (
                        <>
                          {latinWords[wordIndex]
                            ?.split('~')
                            .map((item, index) => {
                              return (
                                <Text
                                  key={index}
                                  style={[
                                    styles.activeWordText,
                                    {
                                      color:
                                        index == pointer
                                          ? color.blue
                                          : color.black,
                                      textDecorationLine:
                                        index == pointer ? 'underline' : null,
                                    },
                                  ]}>
                                  {upperCasePhoneme
                                    ? item.toUpperCase().trim('')
                                    : item.toLowerCase().trim('')}
                                </Text>
                              );
                            })}
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity
                    onPress={() => {
                      if (preventState.next) {
                        if (!loading) {
                          onNextPress();
                        }
                      } else {
                      }
                    }}
                    style={styles.nextPreviousButton}>
                    {preventState.next ? (
                      <Image
                        source={require('../assets/images/next_enable.png')}
                        style={styles.nextPreviousButton}
                      />
                    ) : (
                      <Image
                        source={require('../assets/images/next_disabled.png')}
                        style={styles.nextPreviousButton}
                      />
                    )}
                  </TouchableOpacity>
                </View>

                {activeTab === 'dictionary' ? (
                  <View
                    style={{
                      alignItems: 'center',
                      flexDirection: 'row',
                      marginTop: 20,
                      paddingHorizontal: 20,
                      justifyContent: 'space-evenly',
                    }}>
                    <RecordButton defaultIndexNumber={1} />
                    <RecordButton defaultIndexNumber={2} />
                    <RecordButton defaultIndexNumber={3} />
                  </View>
                ) : (
                  <View style={{justifyContent: 'center', marginTop: 20}}>
                    <View
                      style={{
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'row',
                        flexWrap: 'wrap',
                      }}>
                      {wordsList.map((item, index) => {
                        return (
                          <View key={index}>
                            {index != wordIndex ? (
                              <TouchableOpacity
                                onPress={async () => {
                                  await setPointer(-1);
                                  await setWordIndex(index);
                                  await setPreventState({next: true});
                                  AsyncStorage.setItem(
                                    'saveData',
                                    JSON.stringify({
                                      pointer: -1,
                                      wordIndex: index,
                                      selectedValue: selectedValue,
                                    }),
                                  );
                                  this.player && this.player.seek(0);
                                  setPlay(true);
                                }}
                                style={{marginRight: 7, marginLeft: 7}}>
                                <Text
                                  style={{
                                    fontWeight: '600',
                                    fontSize:
                                      DEVICE_HEIGHT > constant.TABLET_HEIGHT
                                        ? constant.SMALLCASE_BIG
                                        : constant.SMALLCASE_SMALL,
                                    color: color.black,
                                    letterSpacing: 1.5,
                                  }}>
                                  {item.toLowerCase()}
                                </Text>
                              </TouchableOpacity>
                            ) : (
                              <Text
                                style={{
                                  marginLeft: 7,
                                  marginRight: 6,
                                  letterSpacing: 1.5,
                                }}>
                                {getBottomActiveWord(item, index)}
                              </Text>
                            )}
                          </View>
                        );
                      })}
                    </View>
                  </View>
                )}
              </View>
            </>
          )}
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    height: DEVICE_HEIGHT,
    alignItems: 'center',
    backgroundColor: color.white,
    // justifyContent: 'center',
  },
  mainContainer: {
    marginTop: DEVICE_HEIGHT / 30,
    alignItems: 'center',
    width: DEVICE_WIDTH / 1.15,
    backgroundColor: color.white,
  },
  videoContainer: {
    zIndex: -5,
    height:
      Platform.OS == 'ios'
        ? DEVICE_HEIGHT > constant.TABLET_HEIGHT
          ? DEVICE_HEIGHT / 1.6
          : DEVICE_HEIGHT / 1.85
        : DEVICE_HEIGHT / 1.65,
    width: DEVICE_WIDTH / 1.1,
    marginTop: DEVICE_HEIGHT / 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  speedIcon: {
    height:
      DEVICE_HEIGHT > constant.TABLET_HEIGHT
        ? constant.THREE_ICON_BIG
        : constant.THREE_ICON_SMALL,
    width:
      DEVICE_HEIGHT > constant.TABLET_HEIGHT
        ? constant.THREE_ICON_BIG
        : constant.THREE_ICON_SMALL,
    top: DEVICE_HEIGHT < 700 ? -10 : 5,
    left: DEVICE_HEIGHT < 700 ? -20 : 0,
    position: 'absolute',
  },
  faceIcon: {
    height:
      DEVICE_HEIGHT > constant.TABLET_HEIGHT
        ? constant.THREE_ICON_BIG
        : constant.THREE_ICON_SMALL,
    width:
      DEVICE_HEIGHT > constant.TABLET_HEIGHT
        ? constant.THREE_ICON_BIG
        : constant.THREE_ICON_SMALL,
    top: DEVICE_HEIGHT < 700 ? -10 : 5,
    right: DEVICE_HEIGHT < 700 ? -20 : 0,
    position: 'absolute',
  },
  playButton: {
    position: 'absolute',
    bottom: 10,
    height:
      DEVICE_HEIGHT > constant.TABLET_HEIGHT
        ? constant.PLAY_BIG
        : constant.PLAY_SMALL,
    width:
      DEVICE_HEIGHT > constant.TABLET_HEIGHT
        ? constant.PLAY_BIG
        : constant.PLAY_SMALL,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: color.white,
    borderWidth: 1.2,
  },
  headingText: {
    // fontSize: 20,
    fontSize: constant.DEVICE_HEIGHT > constant.TABLET_HEIGHT ? 24 : 20,
    fontWeight: '700',
    width: DEVICE_WIDTH / 1.2,
    marginBottom: DEVICE_HEIGHT / 40,
    color: color.black,
  },
  subText: {
    marginTop: DEVICE_HEIGHT / 40,
    marginLeft: DEVICE_WIDTH / 40,
    fontWeight: '600',
    fontSize: constant.DEVICE_HEIGHT > constant.TABLET_HEIGHT ? 18 : 14,
    color: color.black,
  },
  nextButton: {
    height: constant.DEVICE_HEIGHT > constant.TABLET_HEIGHT ? 65 : 50,
    width: constant.DEVICE_HEIGHT > constant.TABLET_HEIGHT ? 65 : 50,
    borderRadius: constant.DEVICE_HEIGHT > constant.TABLET_HEIGHT ? 33 : 25,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: color.black,
  },
  backgroundVideo: {
    height: '100%',
    width: '99%',
    borderRadius:
      DEVICE_HEIGHT > constant.TABLET_HEIGHT
        ? constant.VIDEO_RADIUS_BIG
        : constant.VIDEO_RADIUS_SMALL,
    borderWidth: 0.7,
  },
  imageView: {
    height: '100%',
    width: '99.99%',
  },
  middleScrollview: {
    marginTop: DEVICE_WIDTH / 30,
    marginBottom: DEVICE_WIDTH / 30,
  },
  activeWordText: {
    letterSpacing: 1,
    fontFamily: Platform.OS == 'ios' ? null : 'NotoSans-Regular',
    marginLeft: 5,
    marginRight: 5,
    fontWeight: '700',
    fontSize:
      DEVICE_HEIGHT > constant.TABLET_HEIGHT
        ? constant.ACTIVE_WORD_BIG
        : constant.ACTIVE_WORD_SMALL,
  },
  phonemeTexts: {
    marginLeft: DEVICE_WIDTH / 22,
    marginRight: DEVICE_WIDTH / 22,
    color: color.black,
    fontSize:
      DEVICE_HEIGHT > constant.TABLET_HEIGHT
        ? constant.SMALLCASE_BIG
        : constant.SMALLCASE_SMALL,
  },
  middleView: {
    height:
      DEVICE_HEIGHT > constant.TABLET_HEIGHT
        ? DEVICE_HEIGHT / 16
        : DEVICE_HEIGHT / 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  bottomIcons: {
    width: DEVICE_WIDTH / 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomView: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
  },
  nextPreviousButton: {
    height:
      constant.DEVICE_HEIGHT > constant.TABLET_HEIGHT
        ? constant.NEXT_BUTTON_BIG
        : constant.NEXT_BUTTON_SMALL,
    width:
      constant.DEVICE_HEIGHT > constant.TABLET_HEIGHT
        ? constant.NEXT_BUTTON_BIG
        : constant.NEXT_BUTTON_SMALL,
  },
  bottomWordsText: {
    marginLeft: 5,
    marginRight: 5,
    fontWeight: '700',
    fontSize:
      DEVICE_HEIGHT > constant.TABLET_HEIGHT
        ? constant.ACTIVE_WORD_BIG
        : constant.ACTIVE_WORD_SMALL,
  },
});

export default MainScreen;
