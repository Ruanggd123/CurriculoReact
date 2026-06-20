import { ref, get, set, update, child } from "firebase/database";
import { database } from "./firebase";

// Chave Master (Universal) que permite gerar novas chaves
export const MASTER_KEY = "master-key";

export interface KeyData {
    id: string;
    status: 'active' | 'used';
    createdAt: number;
    usedAt?: number | null;
}

export const keysService = {
    /**
     * Valida uma chave comum no Firebase. Se for válida ('active'),
     * imediatamente a queima ('used') e retorna true.
     */
    async validateAndUseKey(keyStr: string): Promise<boolean> {
        if (!keyStr) return false;
        
        try {
            const dbRef = ref(database);
            const snapshot = await get(child(dbRef, `keys/${keyStr}`));
            
            if (snapshot.exists()) {
                const data = snapshot.val() as KeyData;
                if (data.status === 'active') {
                    // Mark as used (Queimar a key)
                    await update(ref(database, `keys/${keyStr}`), {
                        status: 'used',
                        usedAt: Date.now()
                    });
                    return true;
                }
            }
            return false;
        } catch (error) {
            console.error("Erro ao validar chave:", error);
            return false;
        }
    },

    /**
     * Gera uma nova chave aleatória, salva no Firebase como 'active' e a retorna.
     */
    async generateNewKey(): Promise<string> {
        // Gera uma string de 12 caracteres (ex: A1B2-C3D4-E5F6)
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let newKey = '';
        for (let i = 0; i < 12; i++) {
            newKey += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        newKey = `${newKey.substring(0, 4)}-${newKey.substring(4, 8)}-${newKey.substring(8, 12)}`;

        const keyData: KeyData = {
            id: newKey,
            status: 'active',
            createdAt: Date.now(),
            usedAt: null
        };

        try {
            await set(ref(database, `keys/${newKey}`), keyData);
            return newKey;
        } catch (error) {
            console.error("Erro ao gerar chave:", error);
            throw new Error("Não foi possível salvar a nova chave no banco de dados.");
        }
    },

    /**
     * Lista as chaves geradas do Firebase.
     */
    async listKeys(): Promise<KeyData[]> {
        try {
            const dbRef = ref(database);
            const snapshot = await get(child(dbRef, `keys`));
            
            if (snapshot.exists()) {
                const data = snapshot.val();
                return Object.values(data) as KeyData[];
            }
            return [];
        } catch (error) {
            console.error("Erro ao listar chaves:", error);
            return [];
        }
    }
};
