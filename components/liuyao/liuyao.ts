/**
 * 六爻算命系统
 * 
 * 实现基本的六爻算命功能，包括:
 * 1. 起卦（铜钱法、时间起卦法）
 * 2. 装卦（确定本卦、变卦、世应、六亲、六神等）
 * 3. 基本断卦逻辑
 */

import { YAO_CI_DB } from "./yaoci";

// 爻的类型
export enum YaoType {
    YangYao = 0,     // 少阳 ⚊ (不变)
    YinYao = 1,      // 少阴 ⚋ (不变)
    OldYangYao = 2,  // 老阳 ⚊○ (变爻)
    OldYinYao = 3    // 老阴 ⚋× (变爻)
}

// 八卦
export enum Trigram {
    Qian = 0, // 乾 ☰ (天)
    Dui = 1,  // 兑 ☱ (泽)
    Li = 2,   // 离 ☲ (火)
    Zhen = 3, // 震 ☳ (雷)
    Xun = 4,  // 巽 ☴ (风)
    Kan = 5,  // 坎 ☵ (水)
    Gen = 6,  // 艮 ☶ (山)
    Kun = 7   // 坤 ☷ (地)
}

// 五行
export enum WuXing {
    Jin = 0,  // 金
    Mu = 1,   // 木
    Shui = 2, // 水
    Huo = 3,  // 火
    Tu = 4    // 土
}

// 六亲
export enum LiuQin {
    FuMu = 0,    // 父母
    ZiSun = 1,   // 子孙
    XiongDi = 2, // 兄弟
    QiCai = 3,   // 妻财
    GuanGui = 4  // 官鬼
}

// 六神
export enum LiuShen {
    QingLong = 0, // 青龙
    ZhuQue = 1,   // 朱雀
    GouChen = 2,  // 勾陈
    TengShe = 3,  // 腾蛇
    BaiHu = 4,    // 白虎
    XuanWu = 5    // 玄武
}

// 十天干
export enum TianGan {
    Jia = 0,  // 甲
    Yi = 1,   // 乙
    Bing = 2, // 丙
    Ding = 3, // 丁
    Wu = 4,   // 戊
    Ji = 5,   // 己
    Geng = 6, // 庚
    Xin = 7,  // 辛
    Ren = 8,  // 壬
    Gui = 9   // 癸
}

// 十二地支
export enum DiZhi {
    Zi = 0,    // 子
    Chou = 1,  // 丑
    Yin = 2,   // 寅
    Mao = 3,   // 卯
    Chen = 4,  // 辰
    Si = 5,    // 巳
    Wu = 6,    // 午
    Wei = 7,   // 未
    Shen = 8,  // 申
    You = 9,   // 酉
    Xu = 10,   // 戌
    Hai = 11   // 亥
}

// 单个爻的信息
export interface Yao {
    type: YaoType;      // 爻的类型
    position: number;   // 爻的位置 (1-6)
    tianGan?: TianGan;  // 天干
    diZhi?: DiZhi;      // 地支
    wuXing?: WuXing;    // 五行
    liuQin?: LiuQin;    // 六亲
    liuShen?: LiuShen;  // 六神
    isShiYao?: boolean; // 是否是世爻
    isYingYao?: boolean;// 是否是应爻
}

// 完整的卦象
export interface Gua {
    yaos: Yao[];          // 六个爻，从下到上排列
    upperTrigram: Trigram;// 上卦
    lowerTrigram: Trigram;// 下卦
    guaIndex: number;     // 卦序 (0-63)
    guaName: string;      // 卦名
    guaWuXing: WuXing;    // 卦的五行属性
    shiYao: number;       // 世爻位置 (1-6)
    yingYao: number;      // 应爻位置 (1-6)
    month?: number;       // 月份 (1-12)
    day?: number;         // 日期 (1-31)
    hour?: number;        // 时辰 (0-23)
    dayGan?: TianGan;     // 日干
}

// 64卦的基本信息
// 64卦的基本信息
const HEXAGRAMS = [
    { name: "乾为天", wuXing: WuXing.Jin }, // 0
    { name: "坤为地", wuXing: WuXing.Tu },  // 1
    { name: "水雷屯", wuXing: WuXing.Mu },  // 2
    { name: "山水蒙", wuXing: WuXing.Shui }, // 3
    { name: "水天需", wuXing: WuXing.Shui }, // 4
    { name: "天水讼", wuXing: WuXing.Jin },  // 5
    { name: "地水师", wuXing: WuXing.Tu },   // 6
    { name: "水地比", wuXing: WuXing.Shui }, // 7
    { name: "风天小畜", wuXing: WuXing.Mu }, // 8
    { name: "天泽履", wuXing: WuXing.Jin },  // 9
    { name: "地天泰", wuXing: WuXing.Tu },   // 10
    { name: "天地否", wuXing: WuXing.Jin },  // 11
    { name: "天火同人", wuXing: WuXing.Jin }, // 12
    { name: "火天大有", wuXing: WuXing.Huo }, // 13
    { name: "地山谦", wuXing: WuXing.Tu },    // 14
    { name: "雷地豫", wuXing: WuXing.Mu },    // 15
    { name: "泽雷随", wuXing: WuXing.Jin },   // 16
    { name: "山风蛊", wuXing: WuXing.Tu },    // 17
    { name: "地泽临", wuXing: WuXing.Tu },    // 18
    { name: "风地观", wuXing: WuXing.Mu },    // 19
    { name: "火雷噬嗑", wuXing: WuXing.Huo },  // 20
    { name: "山火贲", wuXing: WuXing.Tu },     // 21
    { name: "山地剥", wuXing: WuXing.Tu },     // 22
    { name: "地雷复", wuXing: WuXing.Tu },     // 23
    { name: "天雷无妄", wuXing: WuXing.Jin },  // 24
    { name: "山天大畜", wuXing: WuXing.Tu },   // 25
    { name: "山雷颐", wuXing: WuXing.Tu },     // 26
    { name: "泽风大过", wuXing: WuXing.Jin },  // 27
    { name: "水山蹇", wuXing: WuXing.Shui },   // 28
    { name: "火水既济", wuXing: WuXing.Huo },  // 29
    { name: "泽水困", wuXing: WuXing.Jin },    // 30
    { name: "风水涣", wuXing: WuXing.Mu },     // 31
    { name: "雷风恒", wuXing: WuXing.Mu },     // 32
    { name: "天山遁", wuXing: WuXing.Jin },    // 33
    { name: "雷天大壮", wuXing: WuXing.Mu },   // 34
    { name: "火地晋", wuXing: WuXing.Huo },    // 35
    { name: "地火明夷", wuXing: WuXing.Tu },   // 36
    { name: "风火家人", wuXing: WuXing.Mu },   // 37
    { name: "火泽睽", wuXing: WuXing.Huo },    // 38
    { name: "水山蹇", wuXing: WuXing.Shui },   // 39
    { name: "雷水解", wuXing: WuXing.Mu },     // 40
    { name: "山泽损", wuXing: WuXing.Tu },     // 41
    { name: "风雷益", wuXing: WuXing.Mu },     // 42
    { name: "泽天夬", wuXing: WuXing.Jin },    // 43
    { name: "天风姤", wuXing: WuXing.Jin },    // 44
    { name: "泽地萃", wuXing: WuXing.Jin },    // 45
    { name: "地风升", wuXing: WuXing.Tu },     // 46
    { name: "泽水困", wuXing: WuXing.Jin },    // 47
    { name: "水风井", wuXing: WuXing.Shui },   // 48
    { name: "泽火革", wuXing: WuXing.Jin },    // 49
    { name: "火风鼎", wuXing: WuXing.Huo },    // 50
    { name: "震为雷", wuXing: WuXing.Mu },     // 51
    { name: "艮为山", wuXing: WuXing.Tu },     // 52
    { name: "风山渐", wuXing: WuXing.Mu },     // 53
    { name: "雷泽归妹", wuXing: WuXing.Mu },   // 54
    { name: "雷火丰", wuXing: WuXing.Mu },     // 55
    { name: "火山旅", wuXing: WuXing.Huo },    // 56
    { name: "巽为风", wuXing: WuXing.Mu },     // 57
    { name: "兑为泽", wuXing: WuXing.Jin },    // 58
    { name: "风水涣", wuXing: WuXing.Mu },     // 59
    { name: "水泽节", wuXing: WuXing.Shui },   // 60
    { name: "风泽中孚", wuXing: WuXing.Mu },   // 61
    { name: "雷山小过", wuXing: WuXing.Mu },   // 62
    { name: "水火既济", wuXing: WuXing.Shui }, // 63
    { name: "火水未济", wuXing: WuXing.Huo }   // 64
  ];

// 六爻算命类
export class LiuYao {
    private static instance: LiuYao;

    // 单例模式
    public static getInstance(): LiuYao {
        if (!LiuYao.instance) {
            LiuYao.instance = new LiuYao();
        }
        return LiuYao.instance;
    }

    /**
     * 铜钱起卦
     * 模拟三枚铜钱摇卦的过程
     */
    public qiGuaByCoins(): Gua {
        const yaos: Yao[] = [];

        // 从下到上摇六次，生成六个爻
        for (let i = 1; i <= 6; i++) {
            const yaoType = this.throwCoins();
            yaos.push({
                type: yaoType,
                position: i
            });
        }

        const gua = this.createGua(yaos);
        
        // 设置当前日期和日干
        const now = new Date();
        gua.month = now.getMonth() + 1;
        gua.day = now.getDate();
        gua.hour = now.getHours();
        gua.dayGan = this.calculateDayGan(now.getFullYear(), gua.month, gua.day);
        
        return gua;
    }

    /**
     * 时间起卦
     * 根据当前时间生成卦象
     */
    public qiGuaByTime(): Gua {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1;
        const day = now.getDate();
        const hour = now.getHours();
        const minute = now.getMinutes();
        const second = now.getSeconds();

        // 用时间各部分计算出六个爻
        const yaos: Yao[] = [];

        // 初爻：年的各位数 + 月
        let num = (year % 10) + month;
        yaos.push({ type: this.numberToYaoType(num), position: 1 });

        // 二爻：日 + 时
        num = day + hour;
        yaos.push({ type: this.numberToYaoType(num), position: 2 });

        // 三爻：分 + 秒
        num = minute + second;
        yaos.push({ type: this.numberToYaoType(num), position: 3 });

        // 四爻：年的各位数 + 日
        num = (year % 10) + day;
        yaos.push({ type: this.numberToYaoType(num), position: 4 });

        // 五爻：月 + 分
        num = month + minute;
        yaos.push({ type: this.numberToYaoType(num), position: 5 });

        // 六爻：时 + 秒
        num = hour + second;
        yaos.push({ type: this.numberToYaoType(num), position: 6 });

        const gua = this.createGua(yaos);
        gua.month = month;
        gua.day = day;
        gua.hour = hour;

        // 计算日干
        gua.dayGan = this.calculateDayGan(year, month, day);

        return gua;
    }

    /**
     * 手动起卦
     * 根据用户提供的爻值生成卦象
     */
    public qiGuaByManual(yaoValues: number[]): Gua {
        if (yaoValues.length !== 6) {
            throw new Error("必须提供6个爻值");
        }

        const yaos: Yao[] = [];
        for (let i = 0; i < 6; i++) {
            yaos.push({
                type: yaoValues[i] as YaoType,
                position: i + 1
            });
        }

        const gua = this.createGua(yaos);
        
        // 设置当前日期和日干
        const now = new Date();
        gua.month = now.getMonth() + 1;
        gua.day = now.getDate();
        gua.hour = now.getHours();
        gua.dayGan = this.calculateDayGan(now.getFullYear(), gua.month, gua.day);
        
        return gua;
    }

    /**
     * 指定时间起卦
     * 根据用户提供的日期和时辰生成卦象
     */
    public qiGuaBySpecificTime(year: number, month: number, day: number, hour: number, isLunar: boolean = false): Gua {
        // 如果是农历，这里应该有转换逻辑
        // 简化处理，实际应用中需要农历转公历的库
        
        // 用指定时间各部分计算出六个爻
        const yaos: Yao[] = [];
        
        // 模拟随机性，使用日期和时间的各个部分
        const minute = Math.floor(Math.random() * 60);
        const second = Math.floor(Math.random() * 60);

        // 初爻：年的各位数 + 月
        let num = (year % 10) + month;
        yaos.push({ type: this.numberToYaoType(num), position: 1 });

        // 二爻：日 + 时
        num = day + hour;
        yaos.push({ type: this.numberToYaoType(num), position: 2 });

        // 三爻：分 + 秒
        num = minute + second;
        yaos.push({ type: this.numberToYaoType(num), position: 3 });

        // 四爻：年的各位数 + 日
        num = (year % 10) + day;
        yaos.push({ type: this.numberToYaoType(num), position: 4 });

        // 五爻：月 + 分
        num = month + minute;
        yaos.push({ type: this.numberToYaoType(num), position: 5 });

        // 六爻：时 + 秒
        num = hour + second;
        yaos.push({ type: this.numberToYaoType(num), position: 6 });

        const gua = this.createGua(yaos);
        gua.month = month;
        gua.day = day;
        gua.hour = hour;

        // 计算日干
        gua.dayGan = this.calculateDayGan(year, month, day);

        return gua;
    }

    /**
     * 根据爻数组创建完整的卦象
     */
    private createGua(yaos: Yao[]): Gua {
        // 确定本卦的上下卦
        const lowerValue = this.calculateTrigramValue(yaos.slice(0, 3));
        const upperValue = this.calculateTrigramValue(yaos.slice(3, 6));

        const lowerTrigram = lowerValue as Trigram;
        const upperTrigram = upperValue as Trigram;

        // 计算卦序
        const guaIndex = upperValue * 8 + lowerValue;

        // 确定世应
        const { shiYao, yingYao } = this.calculateShiYing(guaIndex);

        // 创建卦象
        const gua: Gua = {
            yaos,
            upperTrigram,
            lowerTrigram,
            guaIndex,
            guaName: HEXAGRAMS[guaIndex].name,
            guaWuXing: HEXAGRAMS[guaIndex].wuXing,
            shiYao,
            yingYao
        };

        // 标记世应爻
        yaos[shiYao - 1].isShiYao = true;
        yaos[yingYao - 1].isYingYao = true;

        return gua;
    }

    /**
     * 摇三枚铜钱
     * 返回对应的爻类型
     */
    private throwCoins(): YaoType {
        // 模拟三枚铜钱，正面为阳(1)，反面为阴(0)
        const coin1 = Math.random() > 0.5 ? 1 : 0;
        const coin2 = Math.random() > 0.5 ? 1 : 0;
        const coin3 = Math.random() > 0.5 ? 1 : 0;

        const sum = coin1 + coin2 + coin3;

        // 根据三枚铜钱的正反面，确定爻的类型
        switch (sum) {
            case 3: // 三个正面，老阳
                return YaoType.OldYangYao;
            case 2: // 两个正面，少阴
                return YaoType.YinYao;
            case 1: // 一个正面，少阳
                return YaoType.YangYao;
            case 0: // 零个正面，老阴
                return YaoType.OldYinYao;
            default:
                throw new Error("铜钱计算错误");
        }
    }

    /**
     * 将数字转换为爻类型
     */
    private numberToYaoType(num: number): YaoType {
        // 对4取余，得到0,1,2,3四种结果，分别对应四种爻
        return num % 4 as YaoType;
    }

    /**
     * 计算卦的三爻值
     * 将三个爻转换为八卦之一
     */
    private calculateTrigramValue(threeYaos: Yao[]): number {
        let value = 0;

        // 将每个爻的阴阳性质转换为二进制数
        // 阳爻(0,2)为1，阴爻(1,3)为0
        for (let i = 0; i < 3; i++) {
            const yao = threeYaos[i];
            const bit = (yao.type === YaoType.YangYao || yao.type === YaoType.OldYangYao) ? 1 : 0;
            value |= (bit << i);
        }

        return value;
    }

    /**
     * 计算世应爻
     */
    private calculateShiYing(guaIndex: number): { shiYao: number, yingYao: number } {
        // 此处简化处理，实际六爻中世应的计算比较复杂
        // 一般根据内外卦、阴阳性质等多种因素决定

        // 简化算法：
        // 阳卦(奇数)：世爻在下卦，应爻在上卦
        // 阴卦(偶数)：世爻在上卦，应爻在下卦
        const isYangGua = guaIndex % 2 === 1;

        if (isYangGua) {
            // 阳卦：世在下卦第二爻，应在上卦第二爻
            return { shiYao: 2, yingYao: 5 };
        } else {
            // 阴卦：世在上卦第二爻，应在下卦第二爻
            return { shiYao: 5, yingYao: 2 };
        }
    }

    /**
     * 计算变卦
     * 根据本卦和变爻，生成变卦
     */
    public calculateBianGua(gua: Gua): Gua {
        const bianYaos: Yao[] = [];

        // 遍历每个爻，如果是变爻则变化
        for (const yao of gua.yaos) {
            const newYao: Yao = { ...yao };

            // 老阳变少阴，老阴变少阳
            if (yao.type === YaoType.OldYangYao) {
                newYao.type = YaoType.YinYao;
            } else if (yao.type === YaoType.OldYinYao) {
                newYao.type = YaoType.YangYao;
            }

            bianYaos.push(newYao);
        }

        return this.createGua(bianYaos);
    }

    /**
     * 纳甲法：分配天干地支
     * 根据Java代码实现的纳甲法
     */
    public naJia(gua: Gua): Gua {
        // 复制卦象，避免修改原始数据
        const newGua = { ...gua, yaos: [...gua.yaos.map(yao => ({ ...yao }))] };
        
        // 根据卦宫确定纳甲规则
        const guaGong = Math.floor(gua.guaIndex / 8);
        
        // 乾宫纳甲规则
        const qianGongTianGan = [TianGan.Jia, TianGan.Bing, TianGan.Wu, TianGan.Geng, TianGan.Ren, TianGan.Wu];
        const qianGongDiZhi = [DiZhi.Zi, DiZhi.Yin, DiZhi.Chen, DiZhi.Wu, DiZhi.Shen, DiZhi.Xu];
        
        // 坤宫纳甲规则
        const kunGongTianGan = [TianGan.Yi, TianGan.Ding, TianGan.Ji, TianGan.Xin, TianGan.Gui, TianGan.Ji];
        const kunGongDiZhi = [DiZhi.Chou, DiZhi.Mao, DiZhi.Si, DiZhi.Wei, DiZhi.You, DiZhi.Hai];
        
        // 震宫纳甲规则
        const zhenGongTianGan = [TianGan.Jia, TianGan.Bing, TianGan.Wu, TianGan.Geng, TianGan.Ren, TianGan.Wu];
        const zhenGongDiZhi = [DiZhi.Zi, DiZhi.Yin, DiZhi.Chen, DiZhi.Wu, DiZhi.Shen, DiZhi.Xu];
        
        // 根据卦宫选择对应的纳甲规则
        let tianGanRule: TianGan[];
        let diZhiRule: DiZhi[];
        
        switch (guaGong) {
            case 0: // 乾宫
                tianGanRule = qianGongTianGan;
                diZhiRule = qianGongDiZhi;
                break;
            case 1: // 坤宫
                tianGanRule = kunGongTianGan;
                diZhiRule = kunGongDiZhi;
                break;
            case 3: // 震宫
                tianGanRule = zhenGongTianGan;
                diZhiRule = zhenGongDiZhi;
                break;
            default: // 其他宫，简化处理
                tianGanRule = qianGongTianGan;
                diZhiRule = qianGongDiZhi;
        }
        
        // 应用纳甲规则
        for (let i = 0; i < 6; i++) {
            const yao = newGua.yaos[i];
            
            // 分配天干地支
            yao.tianGan = tianGanRule[i];
            yao.diZhi = diZhiRule[i];
            
            // 根据地支确定五行
            yao.wuXing = this.diZhiToWuXing(yao.diZhi);
        }
        
        return newGua;
    }

    /**
     * 安六亲：确定每个爻的六亲关系
     */
    public anLiuQin(gua: Gua): Gua {
        // 复制卦象，避免修改原始数据
        const newGua = { ...gua, yaos: [...gua.yaos.map(yao => ({ ...yao }))] };

        // 用神五行，通常以世爻的五行作为用神
        const yongShenWuXing = newGua.yaos[newGua.shiYao - 1].wuXing;

        if (yongShenWuXing === undefined) {
            throw new Error("爻的五行未定义，请先执行纳甲");
        }

        // 确定六亲关系
        for (const yao of newGua.yaos) {
            if (yao.wuXing === undefined) continue;

            yao.liuQin = this.determineLiuQin(yongShenWuXing, yao.wuXing);
        }

        return newGua;
    }

    /**
     * 安六神：分配六神
     */
    public anLiuShen(gua: Gua): Gua {
        // 复制卦象，避免修改原始数据
        const newGua = { ...gua, yaos: [...gua.yaos.map(yao => ({ ...yao }))] };

        // 如果没有日干，使用当前日期计算一个默认日干
        if (newGua.dayGan === undefined) {
            const now = new Date();
            const year = now.getFullYear();
            const month = now.getMonth() + 1;
            const day = now.getDate();
            newGua.dayGan = this.calculateDayGan(year, month, day);
        }

        // 根据日干确定六神起始位置
        const startLiuShen = this.dayGanToStartLiuShen(newGua.dayGan);

        // 分配六神，从上爻开始
        for (let i = 0; i < 6; i++) {
            // 六神顺序：青龙、朱雀、勾陈、腾蛇、白虎、玄武
            newGua.yaos[5-i].liuShen = ((startLiuShen + i) % 6) as LiuShen;
        }

        return newGua;
    }

    /**
     * 断卦：综合分析卦象
     */
    public duanGua(gua: Gua): string {
        // 此处仅给出简单的示例，实际断卦需要综合考虑多种因素
        let result = `卦名：${gua.guaName}\n`;
        result += `卦象：${this.formatGua(gua)}\n`;

        // 分析世应
        result += `世爻：第${gua.shiYao}爻，应爻：第${gua.yingYao}爻\n`;

        // 分析变爻
        const bianYaos = gua.yaos.filter(yao =>
            yao.type === YaoType.OldYangYao || yao.type === YaoType.OldYinYao
        );

        if (bianYaos.length > 0) {
            result += "变爻：";
            result += bianYaos.map(yao => `第${yao.position}爻`).join("、");
            result += "\n";

            // 计算变卦
            const bianGua = this.calculateBianGua(gua);
            result += `变卦：${bianGua.guaName}\n`;
        } else {
            result += "无变爻，为纯卦\n";
        }

        // 分析六亲
        if (gua.yaos[0].liuQin !== undefined) {
            result += "六亲分析：\n";
            for (const yao of gua.yaos) {
                if (yao.liuQin === undefined) continue;
                result += `  第${yao.position}爻：${this.liuQinToString(yao.liuQin)}`;
                if (yao.isShiYao) result += "（世）";
                if (yao.isYingYao) result += "（应）";
                result += "\n";
            }
        }

        // 分析六神
        if (gua.yaos[0].liuShen !== undefined) {
            result += "六神分析：\n";
            for (const yao of gua.yaos) {
                if (yao.liuShen === undefined) continue;
                result += `  第${yao.position}爻：${this.liuShenToString(yao.liuShen)}\n`;
            }
        }

        // 综合判断（简化版）
        result += "\n总体断卦：\n";

        // 判断世爻的状态
        const shiYao = gua.yaos[gua.shiYao - 1];

        if (shiYao.type === YaoType.YangYao || shiYao.type === YaoType.OldYangYao) {
            result += "世爻为阳，";
            if (shiYao.position % 2 === 1) {
                result += "居奇位，得位。";
            } else {
                result += "居偶位，失位。";
            }
        } else {
            result += "世爻为阴，";
            if (shiYao.position % 2 === 0) {
                result += "居偶位，得位。";
            } else {
                result += "居奇位，失位。";
            }
        }

        // 简单的吉凶判断
        if (shiYao.type === YaoType.OldYangYao || shiYao.type === YaoType.OldYinYao) {
            result += " 世爻为变爻，事情将有变化。";
        }

        return result;
    }

    /**
     * 格式化展示卦象
     */
    private formatGua(gua: Gua): string {
        let result = "";

        // 从上到下展示六个爻
        for (let i = 5; i >= 0; i--) {
            const yao = gua.yaos[i];

            switch (yao.type) {
                case YaoType.YangYao:
                    result += "———";
                    break;
                case YaoType.YinYao:
                    result += "— —";
                    break;
                case YaoType.OldYangYao:
                    result += "—○—";
                    break;
                case YaoType.OldYinYao:
                    result += "—×—";
                    break;
            }

            if (yao.isShiYao) result += " 世";
            if (yao.isYingYao) result += " 应";

            result += "\n";
        }

        return result;
    }

    /**
     * 计算日干
     */
    private calculateDayGan(year: number, month: number, day: number): TianGan {
        // 简化的日干计算方法，实际应用中需要更准确的算法
        // 此处仅作演示
        let days = 0;

        // 计算从公元元年到当前年的天数
        for (let y = 1; y < year; y++) {
            days += this.isLeapYear(y) ? 366 : 365;
        }

        // 加上当年的天数
        for (let m = 1; m < month; m++) {
            days += this.getDaysInMonth(year, m);
        }

        days += day;

        // 计算日干，假设公元元年一月一日为甲子日
        return (days % 10) as TianGan;
    }

    /**
     * 判断是否为闰年
     */
    private isLeapYear(year: number): boolean {
        return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
    }

    /**
     * 获取月份的天数
     */
    private getDaysInMonth(year: number, month: number): number {
        const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

        if (month === 2 && this.isLeapYear(year)) {
            return 29;
        }

        return daysInMonth[month - 1];
    }

    /**
     * 地支转五行
     */
    private diZhiToWuXing(diZhi?: DiZhi): WuXing | undefined {
        if (diZhi === undefined) return undefined;
        
        // 子、申为水，寅、午为火，辰、戌、丑、未为土，亥、卯为木，巳、酉为金
        switch (diZhi) {
            case DiZhi.Zi:
            case DiZhi.Shen:
                return WuXing.Shui;
            case DiZhi.Yin:
            case DiZhi.Wu:
                return WuXing.Huo;
            case DiZhi.Chen:
            case DiZhi.Xu:
            case DiZhi.Chou:
            case DiZhi.Wei:
                return WuXing.Tu;
            case DiZhi.Hai:
            case DiZhi.Mao:
                return WuXing.Mu;
            case DiZhi.Si:
            case DiZhi.You:
                return WuXing.Jin;
            default:
                return WuXing.Tu; // 默认为土
        }
    }

    /**
     * 确定六亲关系
     */
    private determineLiuQin(yongShenWuXing: WuXing, currentWuXing: WuXing): LiuQin {
        // 同我者为兄弟，我生者为子孙，我克者为官鬼，生我者为父母，克我者为妻财

        if (yongShenWuXing === currentWuXing) {
            return LiuQin.XiongDi; // 兄弟
        }

        if (this.isWuXingGenerate(yongShenWuXing, currentWuXing)) {
            return LiuQin.ZiSun; // 子孙
        }

        if (this.isWuXingRestrict(yongShenWuXing, currentWuXing)) {
            return LiuQin.GuanGui; // 官鬼
        }

        if (this.isWuXingGenerate(currentWuXing, yongShenWuXing)) {
            return LiuQin.FuMu; // 父母
        }

        if (this.isWuXingRestrict(currentWuXing, yongShenWuXing)) {
            return LiuQin.QiCai; // 妻财
        }

        return LiuQin.XiongDi; // 默认为兄弟
    }

    /**
     * 判断五行相生关系
     * a生b返回true
     */
    private isWuXingGenerate(a: WuXing, b: WuXing): boolean {
        // 金生水，水生木，木生火，火生土，土生金
        return (
            (a === WuXing.Jin && b === WuXing.Shui) ||
            (a === WuXing.Shui && b === WuXing.Mu) ||
            (a === WuXing.Mu && b === WuXing.Huo) ||
            (a === WuXing.Huo && b === WuXing.Tu) ||
            (a === WuXing.Tu && b === WuXing.Jin)
        );
    }

    /**
     * 判断五行相克关系
     * a克b返回true
     */
    private isWuXingRestrict(a: WuXing, b: WuXing): boolean {
        // 金克木，木克土，土克水，水克火，火克金
        return (
            (a === WuXing.Jin && b === WuXing.Mu) ||
            (a === WuXing.Mu && b === WuXing.Tu) ||
            (a === WuXing.Tu && b === WuXing.Shui) ||
            (a === WuXing.Shui && b === WuXing.Huo) ||
            (a === WuXing.Huo && b === WuXing.Jin)
        );
    }

    /**
     * 根据日干确定六神起始位置
     */
    private dayGanToStartLiuShen(dayGan: TianGan): LiuShen {
        // 根据日干确定六神起始位置
        switch (dayGan) {
            case TianGan.Jia:
            case TianGan.Yi:
                return LiuShen.QingLong; // 青龙
            case TianGan.Bing:
            case TianGan.Ding:
                return LiuShen.ZhuQue; // 朱雀
            case TianGan.Wu:
            case TianGan.Ji:
                return LiuShen.GouChen; // 勾陈
            case TianGan.Geng:
            case TianGan.Xin:
                return LiuShen.TengShe; // 腾蛇
            case TianGan.Ren:
            case TianGan.Gui:
                return LiuShen.BaiHu; // 白虎
            default:
                return LiuShen.XuanWu; // 玄武
        }
    }

    /**
     * 六亲名称
     */
    private liuQinToString(liuQin: LiuQin): string {
        const names = ["父母", "子孙", "兄弟", "妻财", "官鬼"];
        return names[liuQin];
    }

    /**
     * 六神名称
     */
    private liuShenToString(liuShen: LiuShen): string {
        const names = ["青龙", "朱雀", "勾陈", "腾蛇", "白虎", "玄武"];
        return names[liuShen];
    }

    /**
     * 计算伏卦
     * 伏卦是本卦的地下卦，即本卦的暗藏之象
     */
    public calculateFuGua(gua: Gua): Gua {
        // 伏卦的计算方法：将本卦的六个爻全部变为不变爻（老阳变少阳，老阴变少阴）
        const fuYaos: Yao[] = [];

        for (const yao of gua.yaos) {
            const newYao: Yao = { ...yao };
            
            // 老阳变少阳，老阴变少阴
            if (yao.type === YaoType.OldYangYao) {
                newYao.type = YaoType.YangYao;
            } else if (yao.type === YaoType.OldYinYao) {
                newYao.type = YaoType.YinYao;
            }
            
            fuYaos.push(newYao);
        }

        return this.createGua(fuYaos);
    }

    /**
     * 计算互卦
     * 互卦是由本卦的第二、三、四爻作下卦，第三、四、五爻作上卦而成
     */
    public calculateHuGua(gua: Gua): Gua {
        const huYaos: Yao[] = [];
        
        // 下卦：第二、三、四爻
        huYaos.push({ ...gua.yaos[1], position: 1 });
        huYaos.push({ ...gua.yaos[2], position: 2 });
        huYaos.push({ ...gua.yaos[3], position: 3 });
        
        // 上卦：第三、四、五爻
        huYaos.push({ ...gua.yaos[2], position: 4 });
        huYaos.push({ ...gua.yaos[3], position: 5 });
        huYaos.push({ ...gua.yaos[4], position: 6 });
        
        return this.createGua(huYaos);
    }

    /**
     * 计算错卦
     * 错卦是将本卦的六个爻全部颠倒（阴变阳，阳变阴）
     */
    public calculateCuoGua(gua: Gua): Gua {
        const cuoYaos: Yao[] = [];
        
        for (const yao of gua.yaos) {
            const newYao: Yao = { ...yao };
            
            // 阴阳颠倒
            if (yao.type === YaoType.YangYao) {
                newYao.type = YaoType.YinYao;
            } else if (yao.type === YaoType.YinYao) {
                newYao.type = YaoType.YangYao;
            } else if (yao.type === YaoType.OldYangYao) {
                newYao.type = YaoType.OldYinYao;
            } else if (yao.type === YaoType.OldYinYao) {
                newYao.type = YaoType.OldYangYao;
            }
            
            cuoYaos.push(newYao);
        }
        
        return this.createGua(cuoYaos);
    }

    /**
     * 计算综卦
     * 综卦是将本卦的六个爻上下颠倒
     */
    public calculateZongGua(gua: Gua): Gua {
        const zongYaos: Yao[] = [];
        
        // 上下颠倒
        for (let i = 5; i >= 0; i--) {
            const newYao: Yao = { ...gua.yaos[i], position: 6 - i };
            zongYaos.push(newYao);
        }
        
        return this.createGua(zongYaos);
    }

    /**
     * 获取爻辞
     * 根据爻的位置和性质获取对应的爻辞
     */
    public getYaoCi(yao: Yao, guaIndex: number): string {
        // 实际应用中需要一个完整的爻辞数据库
        // 这里使用简化的爻辞
        const position = yao.position;
        const isYang = yao.type === YaoType.YangYao || yao.type === YaoType.OldYangYao;
        
        // 如果有对应卦的爻辞数据，则使用
        if (YAO_CI_DB[guaIndex] && YAO_CI_DB[guaIndex][position - 1]) {
            return YAO_CI_DB[guaIndex][position - 1];
        }
        
        // 否则返回通用爻辞
        return `${isYang ? '阳' : '阴'}爻在第${position}位，${isYang ? '刚健' : '柔顺'}之象。`;
    }
}

// 使用示例
function demo() {
    const liuYao = LiuYao.getInstance();

    console.log("====== 铜钱起卦 ======");
    const gua1 = liuYao.qiGuaByCoins();
    console.log(liuYao.duanGua(gua1));

    console.log("\n====== 时间起卦 ======");
    const gua2 = liuYao.qiGuaByTime();

    // 装卦
    const gua2WithNaJia = liuYao.naJia(gua2);
    const gua2WithLiuQin = liuYao.anLiuQin(gua2WithNaJia);
    const fullGua2 = liuYao.anLiuShen(gua2WithLiuQin);

    console.log(liuYao.duanGua(fullGua2));
}

demo();