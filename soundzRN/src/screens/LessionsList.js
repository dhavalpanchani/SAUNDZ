import React, { createRef, useEffect, useRef, useState } from 'react';
import type { PropsWithChildren } from 'react';
import {
    Dimensions,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    useColorScheme,
    View,
    Modal,
    FlatList,
    TextInput,
} from 'react-native';
import {
    Colors,
    DebugInstructions,
    Header,
    LearnMoreLinks,
    ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { color } from '../components/style/colors';
import { constant } from '../components/constant/constants';

// const DEVICE_WIDTH = Dimensions.get('window').width;
// const DEVICE_HEIGHT = Dimensions.get('window').height;

function LessionsList({
    onChangeLession,
    selectedValue,
    setSelectedValue,
    data,
}) {
    const [open, setOpen] = useState(false);

    const [searchText, setSearchText] = useState('');
    const [filter, setFilter] = useState([]);

    const myListRef = useRef(null);

    const openModal = () => {
        setOpen(true);
        const index2 = data.findIndex(obj => obj == selectedValue);
        const index = filter.findIndex(obj => obj == selectedValue);
        if (index == -1) {
            setTimeout(() => {
                this.flatListRef2.scrollTo({
                    x: 0,
                    y: 50 * index2,
                    animated: true,
                });
            }, 100);
        } else {
            setTimeout(() => {
                this.flatListRef.scrollTo({
                    x: 0,
                    y: 50 * index,
                    animated: true,
                });
            }, 100);
        }
    };

    const searchAction = text => {
        if (text) {
            const newData = data.filter(item => {
                const itemData = `${item.data.toLowerCase()}`;
                const textData = text.toLowerCase();
                return itemData.indexOf(textData) > -1;
            });
            if (newData == '') {
                setFilter(['']);
                setSearchText(text);
            } else {
                setFilter(newData);
                setSearchText(text);
            }
        } else {
            setFilter([]);
            setSearchText(text);
        }
    };

    return (
        <View style={styles.container}>
            <Modal visible={open}>
                <View style={{ width: constant.DEVICE_WIDTH }}>
                    <View
                        style={{
                            alignItems: 'center',
                            flexDirection: 'row',
                            marginTop: Platform.OS == 'ios' ? constant.DEVICE_HEIGHT / 17 : constant.DEVICE_HEIGHT / 25,
                            marginLeft: constant.DEVICE_WIDTH / 22,
                        }}>
                        <TextInput
                            style={styles.searchBarTextInput}
                            placeholder="Search Lesson..."
                            value={searchText}
                            placeholderTextColor={color.border}
                            onChangeText={text => {
                                searchAction(text);
                            }}
                        />
                        <TouchableOpacity
                            onPress={() => {
                                setOpen(false);
                                setSearchText('');
                            }}
                            style={{ marginLeft: constant.DEVICE_WIDTH / 20 }}>
                            <AntDesign size={constant.DEVICE_HEIGHT > constant.TABLET_HEIGHT ? constant.CLOSE_BIG : constant.CLOSE_SMALL} name="closecircleo" color={color.border} />
                        </TouchableOpacity>
                    </View>
                    <View
                        style={{
                            backgroundColor: color.border,
                            height: 1,
                            width: constant.DEVICE_WIDTH,
                            marginTop: constant.DEVICE_HEIGHT / 50,
                        }}
                    />

                    {filter.length ? (
                        <ScrollView
                            style={styles.scrollView}
                            ref={ref => {
                                this.flatListRef = ref;
                            }}>
                            {filter.map((item, index) => {
                                return (
                                    <View key={index}>
                                        {item == '' ? (
                                            <View
                                                style={{
                                                    height: 50,
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                }}>
                                                <Text style={{ color: color.border }}>
                                                    No Search Lesson Found !
                                                </Text>
                                            </View>
                                        ) : (
                                            <>
                                                <TouchableOpacity
                                                    onPress={() => {
                                                        setSelectedValue(item);
                                                        onChangeLession(item);
                                                        setOpen(false);
                                                    }}
                                                    style={styles.buttonView}>
                                                    <Text
                                                        style={[
                                                            styles.listText,
                                                            {
                                                                color:
                                                                    selectedValue.id == item.id
                                                                        ? color.blue
                                                                        : color.black,
                                                            },
                                                        ]}>
                                                        {item.data}
                                                    </Text>
                                                </TouchableOpacity>
                                                <View
                                                    style={{
                                                        opacity: 0.3,
                                                        backgroundColor: color.border,
                                                        height: 1,
                                                        width: constant.DEVICE_WIDTH,
                                                    }}
                                                />
                                            </>
                                        )}
                                    </View>
                                );
                            })}
                        </ScrollView>
                    ) : (
                        <ScrollView
                            style={styles.scrollView}
                            ref={ref => {
                                this.flatListRef2 = ref;
                            }}>
                            {data.map((item, index) => {
                                return (
                                    <View key={index}>
                                        <TouchableOpacity
                                            onPress={() => {
                                                setSelectedValue(item);
                                                onChangeLession(item);
                                                setOpen(false);
                                            }}
                                            style={styles.buttonView}>
                                            <Text
                                                style={[
                                                    styles.listText,
                                                    {
                                                        color:
                                                            selectedValue.id == item.id
                                                                ? color.blue
                                                                : color.black,
                                                    },
                                                ]}>
                                                {item.data}
                                            </Text>
                                        </TouchableOpacity>
                                        <View
                                            style={{
                                                opacity: 0.3,
                                                backgroundColor: color.border,
                                                height: 1,
                                                width: constant.DEVICE_WIDTH,
                                            }}
                                        />
                                    </View>
                                );
                            })}
                        </ScrollView>
                    )}
                </View>
            </Modal>

            <TouchableOpacity onPress={openModal} style={styles.menuContainer}>
                <Text style={styles.selectedText}>{selectedValue.data}</Text>
                <AntDesign
                    name="caretdown"
                    style={styles.dropDownIcon}
                    color={color.border}
                    size={constant.DEVICE_HEIGHT > constant.TABLET_HEIGHT ? constant.DOWN_BIG : constant.DOWN_SMALL}
                />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        marginTop: Platform.OS == 'ios' ? constant.DEVICE_HEIGHT / 18 : constant.DEVICE_HEIGHT / 25,
        height: constant.DEVICE_HEIGHT > constant.TABLET_HEIGHT ? constant.LIST_CONTAINER_BIG : constant.LIST_CONTAINER_SMALL,
        alignItems: 'center',
        justifyContent: 'center',
    },
    menuContainer: {
        alignItems: 'center',
        flexDirection: 'row',
        height: constant.DEVICE_HEIGHT > constant.TABLET_HEIGHT ? constant.MENU_CONTAINER_BIG : constant.MENU_CONTAINER_SMALL,
        width: constant.DEVICE_WIDTH / 1.1,
        borderWidth: 2,
        borderColor: color.border,
        borderRadius: 8,
    },
    dropDownIcon: {
        marginLeft: constant.DEVICE_HEIGHT > constant.TABLET_HEIGHT ? constant.DEVICE_WIDTH / 20 : constant.DEVICE_WIDTH / 40,
    },
    scrollView: {
        height: constant.DEVICE_HEIGHT / 1.2,
    },
    buttonView: {
        height: constant.DEVICE_HEIGHT > constant.TABLET_HEIGHT ? constant.MENU_CONTAINER_BIG : constant.MENU_CONTAINER_SMALL,
        justifyContent: 'center',
    },
    listText: {
        paddingLeft: constant.DEVICE_WIDTH / 20,
        fontSize: constant.DEVICE_HEIGHT > constant.TABLET_HEIGHT ? constant.LIST_FONT_BIG : constant.LIST_FONT_SMALL,
    },
    searchBarTextInput: {
        height: constant.DEVICE_HEIGHT > constant.TABLET_HEIGHT ? constant.LIST_CONTAINER_BIG : constant.LIST_CONTAINER_SMALL,
        width: constant.DEVICE_WIDTH / 1.25,
        color: color.border,
        borderWidth: 2,
        borderColor: color.border,
        borderRadius: 8,
        paddingLeft: constant.DEVICE_WIDTH / 35,
        fontSize: constant.DEVICE_HEIGHT > constant.TABLET_HEIGHT ? constant.LIST_FONT_BIG : constant.LIST_FONT_SMALL,
    },
    selectedText: {
        width: constant.DEVICE_WIDTH / 1.3,
        marginLeft: constant.DEVICE_WIDTH / 30,
        color: color.border,
        fontSize: constant.DEVICE_HEIGHT > constant.TABLET_HEIGHT ? constant.LIST_FONT_BIG : constant.LIST_FONT_SMALL,
    },
});

export default LessionsList;
