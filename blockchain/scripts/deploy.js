const JobEscrow = artifacts.require("JobEscrow");

module.exports = async function(callback) {
  try {
    console.log("Deploying sample contract for demo...");
    
    // Deploy a sample contract (without sending any ETH)
    const demoFreelancer = "0x123..."; // Some sample address
    const demoJobId = "demo-job-123";
    
    const jobEscrow = await JobEscrow.new(demoFreelancer, demoJobId);
    
    console.log(`Contract deployed at: ${jobEscrow.address}`);
    console.log("Demo contract deployed successfully!");
    
    callback();
  } catch (error) {
    console.error("Error deploying contract:", error);
    callback(error);
  }
}; 