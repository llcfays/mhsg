// BOSS配置文件
module.exports = [
    // BOSS1配置
    {
        id: "BOSS1",
        name: "魔王",
        baseColor: "#3ddc84",
        checkPoints: [
            {x: 135, y: -5, color: "#3ddc84"},
            {x: 144, y: 77, color: "#36c476"},
            {x: -17, y: 76, color: "#3ddc84"},
            {x: 68, y: 42, color: "#ffffff"}
        ],
        clickPoint: {x: 540, y: 1000}
    },
    // BOSS2配置
    {
        id: "BOSS2",
        name: "恶龙",
        checkPoints: [
            {x: 200, y: 200, color: "#FFFFFF"},
            {x: 220, y: 220, color: "#FF0000"},
            {x: 240, y: 240, color: "#00FF00"}
        ],
        clickPoint: {x: 540, y: 1000}
    },
    // BOSS3配置
    {
        id: "BOSS3",
        name: "巨兽",
        checkPoints: [
            {x: 300, y: 300, color: "#FFFFFF"},
            {x: 320, y: 320, color: "#FF0000"},
            {x: 340, y: 340, color: "#00FF00"}
        ],
        clickPoint: {x: 540, y: 1000}
    }
];