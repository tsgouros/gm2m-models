# We are an auction house! We are currently holding
# a bidding for a new pair of shoes. We have bidders numbered
# from 1-999. Unfortunately, our bidding goes very fast, and
# our bidders are prone to holding their signs upside down.
# for example:
#
# |----|       |----| 
# | 89 |  -->  | 68 | 
# |----|       |----|
#
# As our engineer, we would like you to come up with a program that will 
# return the total amount of number that could be read upside down. 

# notes:
# numbers that can be upside down: 1, 6, 9, 8, 0
# if the number contains 2, 4, 5, 7, can't be read upside down.
# input: a number representing the total amount of bidders.
# output: integer representing the number of bidders read upside down.
# 10 -> 01 != 1, leading zero is not allowed.
# 1, 8 -> cannot be read as another number upside down.
# if a number upside down is outside of our range, we wouldnt count upside
# down.

# turning a number upside down:
# 108 -> 801 (reversing order)
# 89 -> 98 -> 68 (reversing order, and flipping needing intergers)

# steps to solve:
# 	- iterate over our range, and keep a counter of numbers that are
#     read upside down.
#   - turn our number to a list, upside-down it
#   - check if the upside down is in range.

def num_down(r):
	good_num = {6:9, 9:6, 0:0, 8:8, 1:1}
	count = 0
	for i in range(1, r+1):
		l = [int(x) for x in str(i)]
		l = l.reverse()
		can_be_upsidedown = True
		for j in range(l):
			if l[j] in good_num:
				l[j] = good_num[j]
			else:
				can_be_upsidedown = False
		if can_be_upsidedown and int(l) <= r:
			count += 1
	return count

# runtime:
# think about the variables we are iterating over:
# 	- looping over all of our range, r.
# 	- looping over l for each r.
# O(r x l)


