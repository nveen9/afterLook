import React from 'react';
import { Button, StyleSheet, SafeAreaView } from "react-native";

const Login = ({ navigation }) => {
    return (
        <SafeAreaView style={styles.container}>
            <Button
                title="Signup"
                color="#B68D40"
                onPress={() => navigation.navigate('Signup')} />
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
});

export default Login;