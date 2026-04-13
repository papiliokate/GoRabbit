export class TimeService {
    static currentUtcDateStr = null;
    static lastFetchTime = 0;
    static serverClientOffsetMs = 0;

    static async fetchTime() {
        try {
            // Fetch current UTC time from a reliable external API
            const response = await fetch('http://worldtimeapi.org/api/timezone/Etc/UTC');
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            
            const serverDate = new Date(data.datetime);
            const localSysDate = new Date();
            
            this.serverClientOffsetMs = serverDate.getTime() - localSysDate.getTime();
            // Shift date by 1 minute so the generated seed date string is previous day until 00:01
            const adjustedDate = new Date(serverDate.getTime() - 60000);
            this.currentUtcDateStr = adjustedDate.toISOString().split('T')[0]; // Extracted YYYY-MM-DD
            this.lastFetchTime = Date.now();
            return this.currentUtcDateStr;

        } catch (error) {
            console.error("Failed to fetch time from API, falling back to local time.", error);
            // Fallback to local clock UTC representation if API fails
            const fallbackDate = new Date();
            this.serverClientOffsetMs = 0;
            const adjustedFallback = new Date(fallbackDate.getTime() - 60000);
            this.currentUtcDateStr = adjustedFallback.toISOString().split('T')[0];
            return this.currentUtcDateStr;
        }
    }

    static getNextResetTimeStr() {
        if (!this.currentUtcDateStr) return "Loading...";
        
        // Accurate current time
        const now = new Date(Date.now() + this.serverClientOffsetMs);

        // Next UTC 00:01
        const nextReset = new Date(Date.UTC(
            now.getUTCFullYear(),
            now.getUTCMonth(),
            now.getUTCDate() + 1,
            0, 1, 0, 0
        )); // Tomorrow at 00:01 UTC

        // If for some reason we are exactly at 00:00:xx, next reset is still tomorrow. 
        // Wait, what if we are between 00:00 and 00:01UTC? 
        // We'll just reset at 00:01.
        if (now.getUTCHours() === 0 && now.getUTCMinutes() < 1) {
             nextReset.setUTCDate(now.getUTCDate());
             nextReset.setUTCHours(0, 1, 0, 0);
        }

        const msUntilReset = nextReset.getTime() - now.getTime();
        
        if (msUntilReset < 0) {
            return "Resetting...";
        }

        const totalSeconds = Math.floor(msUntilReset / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        const hStr = hours.toString().padStart(2, '0');
        const mStr = minutes.toString().padStart(2, '0');
        const sStr = seconds.toString().padStart(2, '0');

        return `New puzzles in.. ${hStr}:${mStr}:${sStr} (Local: ${nextReset.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})})`;
    }
}
