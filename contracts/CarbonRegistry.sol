// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./CarbonCreditNFT.sol";

/**
 * @title CarbonRegistry
 * @dev Registry contract for carbon credit lifecycle management
 * @notice Manages carbon projects, verification, and credit issuance
 */
contract CarbonRegistry is AccessControl, Pausable, ReentrancyGuard {
    using Counters for Counters.Counter;

    // Roles
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");
    bytes32 public constant PROJECT_MANAGER_ROLE = keccak256("PROJECT_MANAGER_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    // State variables
    Counters.Counter private _projectIdCounter;
    Counters.Counter private _verificationIdCounter;
    
    // Reference to the CarbonCreditNFT contract
    CarbonCreditNFT public carbonCreditNFT;

    // Project status enum
    enum ProjectStatus {
        Pending,
        UnderReview,
        Verified,
        Rejected,
        Suspended
    }

    // Verification status enum
    enum VerificationStatus {
        Pending,
        InProgress,
        Approved,
        Rejected
    }

    // Carbon project structure
    struct CarbonProject {
        uint256 projectId;
        string name;
        string description;
        string location;
        string methodology;
        address projectOwner;
        uint256 totalArea;           // Area in hectares
        uint256 estimatedCarbon;     // Estimated carbon in tons
        uint256 issuedCarbon;        // Already issued carbon in tons
        uint256 vintageYear;
        ProjectStatus status;
        uint256 creationDate;
        uint256 lastUpdateDate;
        string[] verificationReports;
        mapping(address => bool) verifiers;
    }

    // Verification report structure
    struct VerificationReport {
        uint256 verificationId;
        uint256 projectId;
        address verifier;
        VerificationStatus status;
        uint256 carbonAmount;        // Amount of carbon verified
        string reportHash;           // IPFS hash of the verification report
        string notes;
        uint256 verificationDate;
        uint256 expiryDate;
    }

    // Mappings
    mapping(uint256 => CarbonProject) public projects;
    mapping(uint256 => VerificationReport) public verificationReports;
    mapping(address => uint256[]) public ownerProjects;
    mapping(address => uint256[]) public verifierReports;
    mapping(string => bool) public usedMethodologies;
    mapping(string => bool) public usedLocations;

    // Events
    event ProjectCreated(
        uint256 indexed projectId,
        address indexed owner,
        string name,
        string location,
        uint256 totalArea,
        uint256 estimatedCarbon
    );

    event ProjectVerified(
        uint256 indexed projectId,
        address indexed verifier,
        bool verified,
        uint256 carbonAmount,
        string reportHash
    );

    event ProjectStatusUpdated(
        uint256 indexed projectId,
        ProjectStatus oldStatus,
        ProjectStatus newStatus,
        address indexed updater
    );

    event VerificationReportSubmitted(
        uint256 indexed verificationId,
        uint256 indexed projectId,
        address indexed verifier,
        uint256 carbonAmount,
        string reportHash
    );

    event VerificationStatusUpdated(
        uint256 indexed verificationId,
        VerificationStatus oldStatus,
        VerificationStatus newStatus,
        address indexed updater
    );

    event CreditsIssued(
        uint256 indexed projectId,
        address indexed recipient,
        uint256 amount,
        uint256[] tokenIds
    );

    event ProjectSuspended(
        uint256 indexed projectId,
        address indexed admin,
        string reason
    );

    // Modifiers
    modifier onlyAdmin() {
        require(hasRole(ADMIN_ROLE, msg.sender), "CarbonRegistry: must have admin role");
        _;
    }

    modifier onlyVerifier() {
        require(hasRole(VERIFIER_ROLE, msg.sender), "CarbonRegistry: must have verifier role");
        _;
    }

    modifier onlyProjectManager() {
        require(hasRole(PROJECT_MANAGER_ROLE, msg.sender), "CarbonRegistry: must have project manager role");
        _;
    }

    modifier onlyMinter() {
        require(hasRole(MINTER_ROLE, msg.sender), "CarbonRegistry: must have minter role");
        _;
    }

    modifier validProjectId(uint256 projectId) {
        require(projectId < _projectIdCounter.current(), "CarbonRegistry: invalid project ID");
        _;
    }

    modifier validVerificationId(uint256 verificationId) {
        require(verificationId < _verificationIdCounter.current(), "CarbonRegistry: invalid verification ID");
        _;
    }

    /**
     * @dev Constructor
     * @param _carbonCreditNFT Address of the CarbonCreditNFT contract
     */
    constructor(address _carbonCreditNFT) {
        require(_carbonCreditNFT != address(0), "CarbonRegistry: invalid NFT contract address");
        
        carbonCreditNFT = CarbonCreditNFT(_carbonCreditNFT);
        
        // Set up roles
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(ADMIN_ROLE, msg.sender);
        _setupRole(VERIFIER_ROLE, msg.sender);
        _setupRole(PROJECT_MANAGER_ROLE, msg.sender);
        _setupRole(MINTER_ROLE, msg.sender);
    }

    /**
     * @dev Create a new carbon project
     * @param name Project name
     * @param description Project description
     * @param location Geographic location
     * @param methodology Verification methodology
     * @param totalArea Total area in hectares
     * @param estimatedCarbon Estimated carbon in tons
     * @param vintageYear Vintage year
     * @return projectId The ID of the created project
     */
    function createProject(
        string memory name,
        string memory description,
        string memory location,
        string memory methodology,
        uint256 totalArea,
        uint256 estimatedCarbon,
        uint256 vintageYear
    ) external onlyProjectManager whenNotPaused nonReentrant returns (uint256) {
        require(bytes(name).length > 0, "CarbonRegistry: project name required");
        require(bytes(description).length > 0, "CarbonRegistry: project description required");
        require(bytes(location).length > 0, "CarbonRegistry: location required");
        require(bytes(methodology).length > 0, "CarbonRegistry: methodology required");
        require(totalArea > 0, "CarbonRegistry: total area must be positive");
        require(estimatedCarbon > 0, "CarbonRegistry: estimated carbon must be positive");
        require(vintageYear > 0 && vintageYear <= block.timestamp, "CarbonRegistry: invalid vintage year");

        uint256 projectId = _projectIdCounter.current();
        _projectIdCounter.increment();

        CarbonProject storage project = projects[projectId];
        project.projectId = projectId;
        project.name = name;
        project.description = description;
        project.location = location;
        project.methodology = methodology;
        project.projectOwner = msg.sender;
        project.totalArea = totalArea;
        project.estimatedCarbon = estimatedCarbon;
        project.issuedCarbon = 0;
        project.vintageYear = vintageYear;
        project.status = ProjectStatus.Pending;
        project.creationDate = block.timestamp;
        project.lastUpdateDate = block.timestamp;

        ownerProjects[msg.sender].push(projectId);

        emit ProjectCreated(projectId, msg.sender, name, location, totalArea, estimatedCarbon);

        return projectId;
    }

    /**
     * @dev Submit a verification report for a project
     * @param projectId Project ID to verify
     * @param carbonAmount Amount of carbon verified in tons
     * @param reportHash IPFS hash of the verification report
     * @param notes Additional notes
     * @param expiryDate Expiry date of the verification
     * @return verificationId The ID of the verification report
     */
    function submitVerificationReport(
        uint256 projectId,
        uint256 carbonAmount,
        string memory reportHash,
        string memory notes,
        uint256 expiryDate
    ) external onlyVerifier validProjectId(projectId) whenNotPaused nonReentrant returns (uint256) {
        CarbonProject storage project = projects[projectId];
        require(project.status == ProjectStatus.UnderReview, "CarbonRegistry: project not under review");
        require(carbonAmount > 0, "CarbonRegistry: carbon amount must be positive");
        require(bytes(reportHash).length > 0, "CarbonRegistry: report hash required");
        require(expiryDate > block.timestamp, "CarbonRegistry: expiry date must be in future");

        uint256 verificationId = _verificationIdCounter.current();
        _verificationIdCounter.increment();

        VerificationReport storage report = verificationReports[verificationId];
        report.verificationId = verificationId;
        report.projectId = projectId;
        report.verifier = msg.sender;
        report.status = VerificationStatus.Pending;
        report.carbonAmount = carbonAmount;
        report.reportHash = reportHash;
        report.notes = notes;
        report.verificationDate = block.timestamp;
        report.expiryDate = expiryDate;

        project.verificationReports.push(reportHash);
        project.verifiers[msg.sender] = true;
        verifierReports[msg.sender].push(verificationId);

        emit VerificationReportSubmitted(verificationId, projectId, msg.sender, carbonAmount, reportHash);

        return verificationId;
    }

    /**
     * @dev Approve or reject a verification report
     * @param verificationId Verification report ID
     * @param approved Whether the verification is approved
     * @param adminNotes Admin notes
     */
    function reviewVerificationReport(
        uint256 verificationId,
        bool approved,
        string memory adminNotes
    ) external onlyAdmin validVerificationId(verificationId) whenNotPaused {
        VerificationReport storage report = verificationReports[verificationId];
        require(report.status == VerificationStatus.Pending, "CarbonRegistry: verification not pending");

        VerificationStatus oldStatus = report.status;
        report.status = approved ? VerificationStatus.Approved : VerificationStatus.Rejected;
        
        if (approved) {
            report.notes = string(abi.encodePacked(report.notes, " | Admin: ", adminNotes));
        }

        CarbonProject storage project = projects[report.projectId];
        if (approved) {
            project.status = ProjectStatus.Verified;
        } else {
            project.status = ProjectStatus.UnderReview;
        }
        project.lastUpdateDate = block.timestamp;

        emit VerificationStatusUpdated(verificationId, oldStatus, report.status, msg.sender);
        emit ProjectStatusUpdated(report.projectId, ProjectStatus.UnderReview, project.status, msg.sender);
    }

    /**
     * @dev Issue carbon credits for a verified project
     * @param projectId Project ID
     * @param recipient Address to receive the credits
     * @param carbonAmount Amount of carbon to issue in tons
     * @param tokenURI URI for the NFT metadata
     * @return tokenIds Array of minted token IDs
     */
    function issueCredits(
        uint256 projectId,
        address recipient,
        uint256 carbonAmount,
        string memory tokenURI
    ) external onlyMinter validProjectId(projectId) whenNotPaused nonReentrant returns (uint256[] memory) {
        CarbonProject storage project = projects[projectId];
        require(project.status == ProjectStatus.Verified, "CarbonRegistry: project not verified");
        require(carbonAmount > 0, "CarbonRegistry: carbon amount must be positive");
        require(project.issuedCarbon + carbonAmount <= project.estimatedCarbon, "CarbonRegistry: exceeds estimated carbon");
        require(recipient != address(0), "CarbonRegistry: invalid recipient");

        // Calculate number of credits to mint (1 credit = 1 ton of carbon)
        uint256 numberOfCredits = carbonAmount / 1e18; // Assuming carbon amount is in wei (1e18 = 1 ton)
        if (numberOfCredits == 0) numberOfCredits = 1;

        uint256[] memory tokenIds = new uint256[](numberOfCredits);
        uint256 carbonPerCredit = carbonAmount / numberOfCredits;

        for (uint256 i = 0; i < numberOfCredits; i++) {
            uint256 tokenId = carbonCreditNFT.mintCredit(
                recipient,
                projectId,
                carbonPerCredit,
                project.vintageYear,
                project.methodology,
                project.location,
                "Mixed Species", // Default species, can be customized
                string(abi.encodePacked(tokenURI, "/", i.toString()))
            );
            tokenIds[i] = tokenId;
        }

        project.issuedCarbon += carbonAmount;
        project.lastUpdateDate = block.timestamp;

        emit CreditsIssued(projectId, recipient, carbonAmount, tokenIds);

        return tokenIds;
    }

    /**
     * @dev Update project status
     * @param projectId Project ID
     * @param newStatus New project status
     */
    function updateProjectStatus(
        uint256 projectId,
        ProjectStatus newStatus
    ) external onlyAdmin validProjectId(projectId) whenNotPaused {
        CarbonProject storage project = projects[projectId];
        ProjectStatus oldStatus = project.status;
        
        require(oldStatus != newStatus, "CarbonRegistry: status unchanged");
        
        project.status = newStatus;
        project.lastUpdateDate = block.timestamp;

        emit ProjectStatusUpdated(projectId, oldStatus, newStatus, msg.sender);
    }

    /**
     * @dev Suspend a project
     * @param projectId Project ID
     * @param reason Reason for suspension
     */
    function suspendProject(
        uint256 projectId,
        string memory reason
    ) external onlyAdmin validProjectId(projectId) whenNotPaused {
        CarbonProject storage project = projects[projectId];
        project.status = ProjectStatus.Suspended;
        project.lastUpdateDate = block.timestamp;

        emit ProjectSuspended(projectId, msg.sender, reason);
    }

    /**
     * @dev Get project information
     * @param projectId Project ID
     * @return name Project name
     * @return description Project description
     * @return location Project location
     * @return methodology Verification methodology
     * @return projectOwner Project owner address
     * @return totalArea Total area in hectares
     * @return estimatedCarbon Estimated carbon in tons
     * @return issuedCarbon Already issued carbon in tons
     * @return vintageYear Vintage year
     * @return status Project status
     * @return creationDate Creation date
     * @return lastUpdateDate Last update date
     */
    function getProjectInfo(uint256 projectId) 
        external 
        view 
        validProjectId(projectId) 
        returns (
            string memory name,
            string memory description,
            string memory location,
            string memory methodology,
            address projectOwner,
            uint256 totalArea,
            uint256 estimatedCarbon,
            uint256 issuedCarbon,
            uint256 vintageYear,
            ProjectStatus status,
            uint256 creationDate,
            uint256 lastUpdateDate
        ) 
    {
        CarbonProject storage project = projects[projectId];
        return (
            project.name,
            project.description,
            project.location,
            project.methodology,
            project.projectOwner,
            project.totalArea,
            project.estimatedCarbon,
            project.issuedCarbon,
            project.vintageYear,
            project.status,
            project.creationDate,
            project.lastUpdateDate
        );
    }

    /**
     * @dev Get verification report information
     * @param verificationId Verification report ID
     * @return projectId Project ID
     * @return verifier Verifier address
     * @return status Verification status
     * @return carbonAmount Carbon amount verified
     * @return reportHash Report hash
     * @return notes Notes
     * @return verificationDate Verification date
     * @return expiryDate Expiry date
     */
    function getVerificationReport(uint256 verificationId) 
        external 
        view 
        validVerificationId(verificationId) 
        returns (
            uint256 projectId,
            address verifier,
            VerificationStatus status,
            uint256 carbonAmount,
            string memory reportHash,
            string memory notes,
            uint256 verificationDate,
            uint256 expiryDate
        ) 
    {
        VerificationReport storage report = verificationReports[verificationId];
        return (
            report.projectId,
            report.verifier,
            report.status,
            report.carbonAmount,
            report.reportHash,
            report.notes,
            report.verificationDate,
            report.expiryDate
        );
    }

    /**
     * @dev Get projects owned by an address
     * @param owner Owner address
     * @return Array of project IDs
     */
    function getProjectsByOwner(address owner) external view returns (uint256[] memory) {
        return ownerProjects[owner];
    }

    /**
     * @dev Get verification reports by verifier
     * @param verifier Verifier address
     * @return Array of verification report IDs
     */
    function getVerificationReportsByVerifier(address verifier) external view returns (uint256[] memory) {
        return verifierReports[verifier];
    }

    /**
     * @dev Get total number of projects
     * @return Total number of projects
     */
    function getTotalProjects() external view returns (uint256) {
        return _projectIdCounter.current();
    }

    /**
     * @dev Get total number of verification reports
     * @return Total number of verification reports
     */
    function getTotalVerificationReports() external view returns (uint256) {
        return _verificationIdCounter.current();
    }

    /**
     * @dev Check if a verifier has verified a project
     * @param projectId Project ID
     * @param verifier Verifier address
     * @return Whether the verifier has verified the project
     */
    function hasVerifierVerifiedProject(uint256 projectId, address verifier) 
        external 
        view 
        validProjectId(projectId) 
        returns (bool) 
    {
        return projects[projectId].verifiers[verifier];
    }

    /**
     * @dev Pause the contract
     */
    function pause() external onlyAdmin {
        _pause();
    }

    /**
     * @dev Unpause the contract
     */
    function unpause() external onlyAdmin {
        _unpause();
    }

    /**
     * @dev Update the CarbonCreditNFT contract address
     * @param newCarbonCreditNFT New contract address
     */
    function updateCarbonCreditNFT(address newCarbonCreditNFT) external onlyAdmin {
        require(newCarbonCreditNFT != address(0), "CarbonRegistry: invalid contract address");
        carbonCreditNFT = CarbonCreditNFT(newCarbonCreditNFT);
    }
}
