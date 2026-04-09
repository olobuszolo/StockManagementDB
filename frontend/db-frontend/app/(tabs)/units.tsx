import { fetchUnits, createUnit } from "@/api/units";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { FlatList, Button, TextInput, View } from "react-native";
import { useState } from "react";

type Unit = {
    id: number;
    name: string;
}


export default function UnitsScreen() {
    const [units, setUnits] = useState([]);
    const [unitName, setUnit] = useState("");

    const handleCreateUnit = async () => {
        try {
            await createUnit(unitName);
            setUnit("");
        } catch (error) {
            console.error("Error creating unit:", error);
        }
    };

    const handleFetchUnits = async () => {
        try {
            const data = await fetchUnits();
            setUnits(data);
        } catch (error) {
            console.error("Error fetching units:", error);
        }
    };

    return (
        <ThemedView>
            <ThemedText style={{ fontSize: 24, fontWeight: 'bold' }}>All Units</ThemedText>
            <Button title="Show all units" onPress={handleFetchUnits} />
            <ThemedText style={{ fontSize: 20, fontWeight: 'bold' }}>Units</ThemedText>
            <FlatList
                data={units}
                keyExtractor={(item: Unit) => item.id.toString()}
                renderItem={({ item }: { item: Unit }) => (
                    <ThemedView>
                        <ThemedText>{item.name}</ThemedText>
                    </ThemedView>
                )}
            />
            <View style={{ height: 1, backgroundColor: 'white', marginVertical: 20 }} />
                <ThemedText style={{ fontSize: 20, fontWeight: 'bold' }}>Create New Unit</ThemedText>
            <TextInput
                placeholder="Unit Name"
                value={unitName}
                onChangeText={setUnit}
                style={{color: 'white'}}
            />
            <Button title="Create Unit" onPress={handleCreateUnit} />
        </ThemedView>
    )
}