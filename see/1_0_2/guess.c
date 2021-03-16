#include <stdio.h>

int main(){
	printf("guess game\n");

	int number = 42;

	int attempt;

	printf("Your first attempt please!\n");
	scanf("%d", &attempt);
	printf("Your attempt is %d\n", attempt);
}
