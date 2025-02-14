## ParcBalance - Parking Space Pricing Simulator v0.2

Author: Li Qian
email: ludwig.peking@gmail.com

### Background

When developers sell parking spaces, the pricing of parking spaces is an important and difficult problem:
If the price is set too high, it may cause difficulties in selling parking spaces, and subsequent price reductions can lead to dissatisfaction among customers who have bought parking spaces at a high price, affecting business reputation;
At the same time, there are differences in the location of parking spaces. Parking spaces near the elevator are of higher value to customers. On the contrary, parking spaces far from the elevator are of lower value to customers. This can cause customers to compete for high-value parking spaces. These premium parking spaces are relatively scarce and should be priced higher.
In addition, there are differences in purchasing power among customers. In a project, sometimes the total price of two types of residential units may differ by more than 50%, and the actual income gap of customers is even greater. Even if customers buying the same type of unit have different income levels and different requirements for convenience. Some customers can pay over 150,000 yuan for a parking space, while others think that parking spaces below 80,000 yuan are too expensive and choose cheaper parking spaces farther away from the project.
Only by taking all these issues into account can a reasonable price be set for parking spaces.

### Method

This project takes all of the above factors into account and fully simulates the relationship between residential products and customer income and behavior. It also considers competition from parking space supplies outside the project. The differences among customers are fully reflected.
The distribution of customer income levels introduces some randomness to reflect the real uncertainty that exists in reality. When the number of units is large, such as more than 100 units, the simulation results are more stable.
Please simulate multiple times to choose a pricing strategy, as high and low pricing strategies each have their own opportunities, and sometimes the plan to sell out is not the plan with the highest income. Multiple simulations can help you choose a strategy that suits you.
This version has a parameter to ensure a minimum sales rate (such as 80%). Projects with lower sales rates, even if they may have higher income, will be excluded. This parameter is adjustable to increase or decrease strategy width.
This version uses a fully transparent pricing system without considering "sales control". Proper sales control is beneficial to maximize developer benefits, but excessive sales control will lose market reputation. Therefore, this version does not consider sales control, but is sufficient to provide reference for moderate sales control.

### Knowledge-based Conclusions

1. External parking space supply is very sensitive to the lower limit of pricing, especially for customers with low income.
2. A mixed income level of customers (such as families with an annual income of 100,000 and 1 million) greatly increases the difficulty of pricing. This creates a difficult situation between de-stocking rate and selling price, and this simulator has full coverage of this situation.
3. High pricing and low pricing strategies each have their own advantages, and sometimes the plan that sells everything is not the plan with the highest income.
4. Less parking space supply is conducive to adopting a high pricing strategy, selecting customers with high payment ability to increase income.
   The above conclusions actually conform to general cognition. This simulator will make this cognition more intuitive and quantifiable, providing specific data support.

### Version Limitations and Next Development Steps

1. This version is mainly for second and third tier markets, such as the population and income levels of cities like Taiyuan, Shijiazhuang, Jinan, etc. It is not applicable to first-tier cities, such as Beijing, Shanghai, Shenzhen and other cities. The next step can consider adding parameter selection for first-tier cities.
2. This version does not consider the issue of "sales control". This version adopts a completely transparent pricing system without considering sales control. Appropriate sales control is beneficial to maximizing the interests of developers, but excessive sales control, which artificially creates excessive price discrimination, will lose market confidence. The next step could be to add the function of sales control. It would need to set the range of sales control within a reasonable range.
3. The main output is the pricing plan that maximizes revenue for developers. That is to say, it maximizes the developer's profit. But it also takes into account the sales rate and vacancy rate of parking spaces, considering situations where customer needs are fully catered for.
   In some cases, these factors also need to be considered, and the next step will be to add these features: 1) Ensure a certain sales rate, for example, 80%, under the scheme with the highest sales volume; 2) Ensure that all are sold under the scheme with the highest sales volume; 3) In the case of ensuring a certain gross profit, such as 15%, the scheme that maximizes the sales ratio.

### User Guide:

1. Prepare the picture as required: mark the parking spaces in blue, the core cylinder in red, the walls in black, and adjust the picture size so that each pixel represents 0.5 meters in reality. Please note that the accuracy of picture processing will affect the calculation results. This version is a trial version.
2. Please select the prepared picture to replace the example picture above.
3. Select the type of product inside the core cylinder, "First Change" roughly represents a house type of about 120㎡, housing priced between 1.6-1.8 million yuan. The corresponding customers are second and third-tier cities, with a family monthly income of about 20,000 yuan.
4. Enter the number of units inside the core cylinder, for example, 18 floors, two units per floor, then enter 36.
5. Click the "Start Simulation" button to start the simulation.

## 车位定价模拟器 v0.2

作者：李谦
email: ludwig.peking@gmail.com

### 背景

开发商销售车位时，车位的定价是一个重要而且困难的问题：
如果订价偏高，可能会导致车位销售困难，而后续降价会引发已经高价买车位的客户的不满，影响商业信誉；
同时，车位之间位置存在差异。距离电梯间近的车位，对于客户价值较高。而距离电梯间远的车位，对于客户价值较低。这会引发客户竞争高价值的车位。这些优质的车位相对稀缺，应该定价更高。
此外，客户的购买力也存在差别。在一个项目中，有时候两种住宅户型的总价相差可能大于 50%，而客户实际的收入水平差距甚至更大。即便购买同一个户型的用户，其收入水平和对便利性的要求也是不同的。有的客户可以支付 15 万以上的价格购买一个车位，而有的客户甚至认为 8 万元以下的车位太贵，而选择项目外距离较远的廉价车位。
能够综合考虑所有这些问题，才能给出合理的车位定价。

### 方法

本项目考虑了上述所有因素，对住宅产品和客户收入和行为之间的关系进行了充分的模拟。也考虑了项目之外的车位供应竞争。客户内部的差异得到充分的体现。
客户的收入水平分布引入了一些随机性，以体现现实中真是存在的不确定性。在户数样本较大，比如大于 100 户的状态，模拟结果更稳定性。
请多次模拟来选择定价策略，因为高价策略和低价策略有各自的机会，有时候全部售出的方案并不是收入最高的方案。多次模拟有助于选择更适合您的策略。
这个版本内有一个参数，来确保一个最低的销售率（比如 80%），销售率更低的项目，即使有可能收入更高，也会被排除掉。这个参数是可以调整的，用来增减策略宽度。
这个版本采用了完全透明的定价体系。而没有考虑“销控”。适当的销控有利于开发商利益的最大化，但是过度的销控会损失市场信誉。所以，这个版本没有考虑销控，但是足以为适度的销控提供参考。

### 知识性的结论

1.外部车位供应，对于定价的下限来说非常敏感。特别是对于收入不高的客户群体。 2.客户的收入水平比较混杂（比如同时存在年收入 10 万和 100 万的家庭）会极大的增大定价难度。造成去化率和售价两难的情况，这个模拟器对这种情况有充分的。 3.高价策略和低价策略有各自的优势，有时候全部售出的方案并不是收入最高的方案。 4.比较少的车位供应，有利于采用高定价策略，选择高支付力客户以提高收入。
上述结论，其实符合一般认知。这个模拟器会把这个认知变得更加直观、量化，给出具体的数据支持。

### 版本局限和下一步开发

1. 这个版本主要针对二三线市场，比如太原、石家庄、济南等城市的人口和收入水平。不适用于一线城市，比如北京、上海、深圳等城市。下一步可以考虑增加一线城市的参数选型。
2. 这个版本没有考虑“销控”的问题。这个版本采用了完全透明的定价体系。而没有考虑销控。适当的销控有利于开发商利益的最大化，但是过度的销控，人为制造过大的价格歧视，会损失市场信心。下一步可以考虑增加销控的功能。需要设置销控的幅度在一个合理的范围。 3.主要输出对于开发商来说收入最高的定价方案。也就是说，最大化了开发商的收益。但是也照顾车位的出售率和空置率，考虑客户需求被充分照顾的情况。
   在有些场合下，这些因素也需要考虑，下一步将增加这些功能：
   1）确保一定的出售率，比如 80%，的情况下，最大销售额的方案；
   2）确保全部售出的情况下，最大的销售额的方案；
   3）在确保一定毛利，比如 15%的情况下，最大化售出比例的方案。

### 使用说明：

1）按照要求处理好图片：用蓝色标记车位，红色标记核心筒，黑色代表墙壁，把图片尺寸调整到每个像素代表现实中 0.5 米。请注意图片处理的精度会影响计算结果。本版是试用版。 2) 请选择处理好的图片，代替上面的示例图片。 3) 选择核心筒的内产品的类型，“首改”大致代表 120㎡ 左右的户型，总价 160-180 万左右的住房。对应的客户是二三线城市，家庭月收入在 2 万元左右。 4) 输入核心筒内户数，比如，18 层，每层两户，则输入 36。 5) 点击“开始模拟”按钮，即可开始模拟。
