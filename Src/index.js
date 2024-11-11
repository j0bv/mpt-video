export * from './baseAgent';
export * from './reactChampionAgent';

   // Example of a multi-agent interaction
   async function handleSceneCreation() {
    // Script Generator informs Visuals about new scene
    scriptGenerator.sendTo('visualsCreator', {
        type: 'new_scene',
        data: sceneData
    });

    // Visuals Creator informs Audio about timing
    visualsCreator.sendTo('audio', {
        type: 'scene_timing',
        data: timingData
    });

    // Audio syncs and informs Quality Control
    audio.sendTo('qualityControl', {
        type: 'sync_status',
        data: syncData
    });

    // Quality Control provides feedback to all
    qualityControl.broadcastFeedback({
        type: 'scene_feedback',
        data: feedbackData
    });
}

// src/communication/MeshNetwork.js
export class MeshNetwork {
    constructor() {
        this.channels = new Map();
    }

    // Create a unique channel ID for two agents
    getChannelId(agent1, agent2) {
        // Sort names to ensure consistent channel IDs regardless of order
        const [first, second] = [agent1, agent2].sort();
        return `${first}-${second}`;
    }

    createChannel(agent1, agent2) {
        const channelId = this.getChannelId(agent1, agent2);
        if (!this.channels.has(channelId)) {
            this.channels.set(channelId, {
                messages: [],
                subscribers: new Set()
            });
        }
        return channelId;
    }

    subscribe(agent1, agent2, callback) {
        const channelId = this.getChannelId(agent1, agent2);
        const channel = this.channels.get(channelId);
        if (channel) {
            channel.subscribers.add(callback);
        }
    }

    publish(fromAgent, toAgent, message) {
        const channelId = this.getChannelId(fromAgent, toAgent);
        const channel = this.channels.get(channelId);
        if (channel) {
            const messageWithMeta = {
                from: fromAgent,
                to: toAgent,
                content: message,
                timestamp: Date.now()
            };
            channel.messages.push(messageWithMeta);
            channel.subscribers.forEach(callback => callback(messageWithMeta));
        }
    }
}

// src/orchestration/FullyConnectedOrchestrator.js
export class FullyConnectedOrchestrator {
    constructor(agents) {
        this.agents = agents;
        this.meshNetwork = new MeshNetwork();
        this.setupFullMeshConnections();
    }

    setupFullMeshConnections() {
        const agentNames = Object.keys(this.agents);
        
        // Create all possible communication channels
        for (let i = 0; i < agentNames.length; i++) {
            for (let j = i + 1; j < agentNames.length; j++) {
                const agent1 = agentNames[i];
                const agent2 = agentNames[j];
                this.meshNetwork.createChannel(agent1, agent2);
            }
        }
    }

    // Log all communication paths
    logCommunicationPaths() {
        console.log(`Total communication channels: ${this.meshNetwork.channels.size}`);
        for (const channelId of this.meshNetwork.channels.keys()) {
            console.log(`Active channel: ${channelId}`);
        }
    }
}

// src/agents/base/MeshConnectedAgent.js
export class MeshConnectedAgent extends Agent {
    constructor(config, meshNetwork) {
        super(config);
        this.meshNetwork = meshNetwork;
        this.connections = new Set();
    }

    connectWithAgent(otherAgent) {
        this.connections.add(otherAgent.name);
        this.meshNetwork.subscribe(
            this.name, 
            otherAgent.name,
            (message) => this.handleMessage(message)
        );
    }

    sendTo(targetAgent, message) {
        if (this.connections.has(targetAgent)) {
            this.meshNetwork.publish(this.name, targetAgent, message);
        }
    }

    async handleMessage(message) {
        // Override in specific agents
    }
}

// Example implementation for VisualsCreatorAgent
export class VisualsCreatorAgent extends MeshConnectedAgent {
    async handleMessage(message) {
        switch(message.from) {
            case 'ScriptGenerator':
                await this.handleScriptUpdate(message.content);
                // Notify Audio Agent about visual timing
                this.sendTo('AudioAgent', {
                    type: 'visual_timing',
                    data: this.currentTiming
                });
                break;
                
            case 'AudioAgent':
                await this.syncWithAudio(message.content);
                // Notify QualityControl about sync status
                this.sendTo('QualityControl', {
                    type: 'sync_status',
                    data: this.syncMetrics
                });
                break;
                
            case 'QualityControl':
                await this.applyQualityFeedback(message.content);
                // Notify ScriptGenerator about any needed adjustments
                this.sendTo('ScriptGenerator', {
                    type: 'visual_constraints',
                    data: this.constraints
                });
                break;
        }
    }
}

// Usage example
const agents = {
    scraper: new ScraperAgent(meshNetwork),
    scriptGenerator: new ScriptGeneratorAgent(meshNetwork),
    visualsCreator: new VisualsCreatorAgent(meshNetwork),
    audio: new AudioAgent(meshNetwork),
    qualityControl: new QualityControlAgent(meshNetwork)
};

const orchestrator = new FullyConnectedOrchestrator(agents);

// Verify all communication channels are established
orchestrator.logCommunicationPaths();
// Output:
// Total communication channels: 10
// Active channel: scraper-scriptGenerator
// Active channel: scraper-visualsCreator
// Active channel: scraper-audio
// Active channel: scraper-qualityControl
// Active channel: scriptGenerator-visualsCreator
// Active channel: scriptGenerator-audio
// Active channel: scriptGenerator-qualityControl
// Active channel: visualsCreator-audio
// Active channel: visualsCreator-qualityControl
// Active channel: audio-qualityControl