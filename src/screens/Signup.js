import React from 'react';
import { Button, StyleSheet, SafeAreaView } from "react-native";

const Signup = () => {
    return (
        <SafeAreaView style={styles.container}>
            <Button
                title="Login"
                color="#B68D40" />
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

export default Signup;